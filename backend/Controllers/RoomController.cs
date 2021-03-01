using Backend.DTO;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class RoomController : ControllerBase
    {
        private readonly ILogger<RoomController> logger;
        private readonly IRoomService roomServices;
        private readonly ITokenService tokenSerivce;
        private readonly IUserService userService;


        public RoomController(ILogger<RoomController> logger, IRoomService roomServices,
            ITokenService tokenService, IUserService userService)
        {
            this.logger = logger;
            this.roomServices = roomServices;
            this.tokenSerivce = tokenService;
            this.userService = userService;
        }


        [HttpPost("create")]
        public IActionResult Create([FromBody] User owner)
        {
            try
            {
                owner = roomServices.Create(owner);
                var response = new RoomResponse()
                {
                    User = owner,
                    Tokens = tokenSerivce.Authenticate(owner) 
                };
                return Ok(response);
            }
            catch (Exception)
            {
                return BadRequest("Unexcepected error durign creation of room");
            }
        }

        [HttpPost("join")]
        public IActionResult Join([FromBody] User user)
        {
            try
            {
                user = userService.CreateUser(user);
                var response = new RoomResponse()
                {
                    User = user,
                    Tokens = tokenSerivce.Authenticate(user)
                };
                return Ok(response);
            }
            catch (Exception)
            {
                return BadRequest("User already joined this room.");
            }
        }
    }
}
