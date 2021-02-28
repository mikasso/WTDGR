using System;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using backend.Models;
using backend.Services;
using backend.JwtManager;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TokensController : ControllerBase
    {
        private readonly ILogger<TokensController> _logger;
        private readonly IUserService _userService;

        public TokensController(ILogger<TokensController> logger, IUserService userService)
        {
            _logger = logger;
            _userService = userService;
        }

        [Authorize(AuthenticationSchemes = "refresh")]
        [HttpPut("accesstoken", Name = "refresh")]
        public IActionResult Refresh()
        {
            //Read from claims data
            var username = User.GetUsername();
            var refreshKey = User.GetRefreshKey();

            try
            {
                return Ok(_userService.Refresh(username,refreshKey));
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}