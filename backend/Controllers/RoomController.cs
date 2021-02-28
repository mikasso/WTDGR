using backend.DTO;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class RoomController : ControllerBase
    {
        private readonly ILogger<RoomController> _logger;
        private readonly IRoomService roomServices;
        private IUserService userService { get; }

        public RoomController(ILogger<RoomController> logger, IRoomService roomServices, IUserService userService)
        {
            _logger = logger;
            this.roomServices = roomServices;
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
                    Tokens = userService.Authenticate(owner) 
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
                    Tokens = userService.Authenticate(user)
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
