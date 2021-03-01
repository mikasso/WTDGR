using System;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Backend.Models;
using Backend.Services;
using Backend.JwtManager;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TokensController : ControllerBase
    {
        private readonly ILogger<TokensController> logger;
        private readonly ITokenService tokenService;

        public TokensController(ILogger<TokensController> logger, ITokenService tokenSerivce)
        {
            this.logger = logger;
            this.tokenService = tokenSerivce;
        }

        [Authorize(AuthenticationSchemes = "refresh")]
        [HttpPut("accesstoken", Name = "refresh")]
        public IActionResult Refresh()
        {
            //Read from claims data
            var userId = User.GetUserId();
            var refreshKey = User.GetRefreshKey();

            try
            {
                return Ok(tokenService.Refresh(userId,refreshKey));
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}