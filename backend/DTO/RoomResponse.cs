using Backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.DTO
{
    public class RoomResponse 
    {
       public User User { get; set; }
       public Tokens Tokens { get; set; }

    }
}
