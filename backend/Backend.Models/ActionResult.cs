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

        public static ActionResult GetNegativeActionResult(UserAction action) => 
            new ActionResult() { IsSucceded = false, Receviers = Receviers.Caller, UserAction = action }; 
    }

    public enum Receviers
    {
        All,
        Caller,
    }
}
