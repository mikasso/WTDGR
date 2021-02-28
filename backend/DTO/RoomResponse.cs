using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTO
{
    public class RoomResponse 
    {
       public User User { get; set; }
       public Tokens Tokens { get; set; }

    }
}
