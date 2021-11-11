using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Backend.Core;
using Backend.Models;

namespace Backend.Service
{
    public class Startup
    {
        public IConfiguration Configuration { get; }
        private readonly VueSettings vue;
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
            vue = new VueSettings
            {
                CorsPolicyName = Configuration["Vue:CorsPolicyName"],
                Url = Configuration["Vue:Url"]
            };
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSingleton<ITimeProvider, TimeProvider>();
            services.AddSingleton<IRoomManagerFactory, RoomManagerFactory>();
            services.AddSingleton<IRoomsContainer, RoomsContainer>();

            services.AddCors(options =>
            {
                options.AddDefaultPolicy( builder =>
                {
                    builder.AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
                });
            });
            services.AddSignalR().AddNewtonsoftJsonProtocol((x) =>
            {
                x.PayloadSerializerSettings.Converters.Add(new RoomItemConverter());
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseCors();
            app.UseRouting();
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHub<GraphHub>("/graphHub");
            });
        }
    }
}