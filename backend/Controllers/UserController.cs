using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Backend.JwtManager;
using System;

namespace Backend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly ILogger<UsersController> _logger;
        private readonly IUserService _userService;

        public UsersController(ILogger<UsersController> logger, IUserService userService)
        {
            _logger = logger;
            _userService = userService;
        }

        [Authorize(Roles = "Owner")]
        [HttpPut("{userId}")]
        public User UpdateOne([FromRoute] string userId, [FromBody] User user)
        {
            _userService.Update(userId, user);
            return user;
        }

        [Authorize(Roles = "Owner")]
        [HttpDelete("{userId}")]
        public IActionResult DeleteOne([FromRoute] string userId)
        {

            var userExists = _userService.UserExistsInRoom(userId, User.GetRoomId());
            if (userExists)
            {
                _userService.Remove(userId);
                return NoContent();
            }
            else
                return NotFound("User doesn't exists in your room");
        }
    }
}