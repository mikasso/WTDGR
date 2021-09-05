using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class ActionResult
    {
        public UserAction UserAction { get; set; }

        public bool IsSucceded { get; set; }

        public Receviers Receviers { get; set;} 
    }

    public enum Receviers
    {
        all,
        caller,
        admins,
        owner,
    }
}
