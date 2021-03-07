using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Backend.Services;
using Microsoft.Extensions.Options;
using Backend.Hubs;
using Backend.Configuration;
using Backend.Helpers;
using Microsoft.AspNetCore.Cors.Infrastructure;

namespace Backend
{
    public class Startup
    {
        public IConfiguration Configuration { get; }
        private readonly VueSettings vue;
        private readonly IJwtParametersOptions jwtSettings;
        public Startup(IConfiguration configuration)
        {
            //Read setting form appsettings.json
            Configuration = configuration;
            vue = new VueSettings
            {
                CorsPolicyName = Configuration["Vue:CorsPolicyName"],
                Url = Configuration["Vue:Url"]
            };
            jwtSettings = new JwtSettings
            {
                Issuer = Configuration["JwtSettings:Issuer"],
                Key = Configuration["JwtSettings:Key"]
            };
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<JwtSettings>(Configuration.GetSection(nameof(JwtSettings)));
            services.Configure<DatabaseSettings>(Configuration.GetSection(nameof(DatabaseSettings)));
            //Signleton for database
            services.AddSingleton<IDatabaseSettings>(sp => sp.GetRequiredService<IOptions<DatabaseSettings>>().Value);
            //Dependency inversion for this classes

            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IRoomService, RoomService>();
            //Start room 1 TODO delete this line
            RoomsContainer.CreateRoom();
            //Configure SPA service 
            services.AddSpaStaticFiles(configuration: options => { options.RootPath = "wwwroot"; });
            services.AddControllers();

            services.AddCors(options =>
            {
                options.AddPolicy(vue.CorsPolicyName, builder =>
                {
                    builder.WithOrigins(vue.Url)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
                });
            });


            services.AddSignalR();
            services.AddMvc(option => option.EnableEndpointRouting = false);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {  
            app.UseRouting();

            app.UseCors(vue.CorsPolicyName);
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<GraphHub>("/graphHub");
            });

            app.UseSpaStaticFiles();
            app.UseSpa(configuration: builder =>
            {
                if (env.IsDevelopment())
                {
                    builder.UseProxyToSpaDevelopmentServer(vue.Url);
                }
            });
        }
    }
}