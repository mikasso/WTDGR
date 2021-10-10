using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Models
{
    //TODO If it is only returned when action failed than maybe change it?
    public class UserActionFailure
    {
        public string Reason { get; set; } = "No additional information";
    }
}
