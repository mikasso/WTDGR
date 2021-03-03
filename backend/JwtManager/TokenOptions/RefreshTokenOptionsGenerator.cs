using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.JwtManager
{
    public class RefreshTokenOptionsGenerator : TokenOptionsGenerator, ITokenOptionsGenerator
    {
        public const string TokenSchemeName = "refresh";
        public RefreshTokenOptionsGenerator( IJwtParametersOptions settings) : base (settings)
        {
            Audience = TokenSchemeName;
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
