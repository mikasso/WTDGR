using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backend.JwtManager
{
    public interface ITokenOptionsGenerator{
        public JwtBearerOptions GetOptions(JwtBearerOptions jwtBearerOptions);
    }

    public abstract class TokenOptionsGenerator : ITokenOptionsGenerator {
        public string Key { get; set;} 
        public string Issuer { get; set;}
        protected string Audience { get; set; }

        public TokenOptionsGenerator(IJwtParametersOptions settings)
        {
            Key = settings.Key;
            Issuer = settings.Issuer;
        }
        public virtual JwtBearerOptions GetOptions(JwtBearerOptions jwtBearerOptions)
        {
            jwtBearerOptions.RequireHttpsMetadata = false;
            jwtBearerOptions.SaveToken = true;
            jwtBearerOptions.TokenValidationParameters = CreateTokenValidationParameters();
            jwtBearerOptions.Events = CreateJwtEventHandler();
            return jwtBearerOptions;
        }

        protected TokenValidationParameters CreateTokenValidationParameters()
        {
            return new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(Key)),
                ValidateAudience = true,
                ValidAudience = Audience,
                ValidIssuer = Issuer,
                ValidateLifetime = true, //validate the expiration and not before values in the token
                ClockSkew = TimeSpan.FromMinutes(1) //1 minute tolerance for the expiration date
            };
        }

        protected JwtBearerEvents CreateJwtEventHandler()
        {
            return new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    var accessToken = context.Request.Query["access_token"];
                    return Task.CompletedTask;
                    // If the request is for our hub...
                    var path = context.HttpContext.Request.Path;
                    if (!string.IsNullOrEmpty(accessToken) &&
                        (path.StartsWithSegments("/chathubs")))
                    {
                        // Read the token out of the query string
                        context.Token = accessToken;

                    }
                    return Task.CompletedTask;
                }
            };
        }
    }
}
