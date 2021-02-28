using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using SignalRChat.Hubs;
using backend.JwtManager;
using backend.JwtTokenManager;
using backend.Models;
using backend.Services;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection.Extensions;
using System;

namespace backend
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<DatabaseSettings>(Configuration.GetSection(nameof(DatabaseSettings)));
            services.AddSingleton<IDatabaseSettings>(sp => sp.GetRequiredService<IOptions<DatabaseSettings>>().Value);
            
            services.Configure<JwtSettings>(Configuration.GetSection("JwtSettings"));
            services.AddScoped<ITokenManager,TokenManager>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IRoomService, RoomService>();

            services.AddSpaStaticFiles(configuration: options => { options.RootPath = "wwwroot"; });
            services.AddControllers();
            services.AddCors(options =>
            {
                options.AddPolicy("VueCorsPolicy", builder =>
                {
                    builder
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .WithOrigins("https://localhost:5001");
                });
            });

            InitalizeAuthentication(services, Configuration);

            services.AddSignalR();
            services.AddMvc(option => option.EnableEndpointRouting = false);
        }

        private void InitalizeAuthentication(IServiceCollection services, IConfiguration Configuration)
        {
            IJwtParametersOptions jwtParamOptions = new JwtSettings
            {
                Issuer = Configuration["JwtSettings:Issuer"],
                Key = Configuration["JwtSettings:Key"]
            };

            var accessToken = new AccessTokenOptionsGenerator(jwtParamOptions);
            var refreshToken = new RefreshTokenOptionsGenerator(jwtParamOptions);

            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
               .AddJwtBearer(jwtBearerOptions =>
                    accessToken.GetOptions(jwtBearerOptions))
               .AddJwtBearer("refresh", jwtBearerOptions =>
                    refreshToken.GetOptions(jwtBearerOptions));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env) //ApplicationDbContext dbContext)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors("VueCorsPolicy");

            //dbContext.Database.EnsureCreated();
            app.UseAuthentication();
            app.UseMvc();
            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<ChatHub>("/chathub");
            });

            app.UseSpaStaticFiles();
            app.UseSpa(configuration: builder =>
            {
                if (env.IsDevelopment())
                {
                    builder.UseProxyToSpaDevelopmentServer("http://localhost:8080");
                }
            });
        }
    }
}