using Microsoft.AspNetCore.Authentication.JwtBearer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.JwtManager
{
    public class AccessTokenOptionsGenerator : TokenOptionsGenerator
    {
        public AccessTokenOptionsGenerator(IJwtParametersOptions settings) : base(settings)
        {
            Audience = "access";
        }
        public override JwtBearerOptions GetOptions(JwtBearerOptions jwtBearerOptions)
        {
            return base.GetOptions(jwtBearerOptions);
        }
    }

}
