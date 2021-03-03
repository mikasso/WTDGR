using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Backend.JwtManager;
using Backend.Services;
using Microsoft.Extensions.Options;
using Backend.Hubs;
using Backend.Configuration;

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
            services.AddScoped<ITokenManager,TokenManager>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IRoomService, RoomService>();
            services.AddScoped<ITokenService, TokenService>();
            //Configure SPA service 
            services.AddSpaStaticFiles(configuration: options => { options.RootPath = "wwwroot"; });
            services.AddControllers();

            services.AddCors(options =>
            {
                options.AddPolicy(vue.CorsPolicyName, builder =>
                {
                    builder
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .AllowAnyOrigin()
                    .WithOrigins(vue.Url);
                });
            });

            InitalizeAuthentication(services);

            services.AddSignalR();
            services.AddMvc(option => option.EnableEndpointRouting = false);
        }

        private void InitalizeAuthentication(IServiceCollection services)
        {
            var accessToken = new AccessTokenOptionsGenerator(jwtSettings);
            var refreshToken = new RefreshTokenOptionsGenerator(jwtSettings);

            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
               .AddJwtBearer(jwtBearerOptions =>
                    accessToken.GetOptions(jwtBearerOptions))
               .AddJwtBearer(RefreshTokenOptionsGenerator.TokenSchemeName, jwtBearerOptions =>
                    refreshToken.GetOptions(jwtBearerOptions));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseCors(vue.CorsPolicyName);
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            //dbContext.Database.EnsureCreated();
            app.UseAuthentication();
            app.UseMvc();
            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
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