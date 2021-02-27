using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.JwtManager
{
    public class RefreshTokenOptionsGenerator : TokenOptionsGenerator, ITokenOptionsGenerator
    {
        public RefreshTokenOptionsGenerator( IJwtSettings settings) : base (settings)
        {
            Audience = "refresh";
        }
        public override JwtBearerOptions GetOptions(JwtBearerOptions jwtBearerOptions)
        {
            jwtBearerOptions = base.GetOptions(jwtBearerOptions);
            jwtBearerOptions.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                    {
                        context.Response.Headers.Add("Token-Expired", "true");
                    }
                    return Task.CompletedTask;
                }
            };
            return jwtBearerOptions;
        }

    }
}
