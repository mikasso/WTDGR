using Backend.Models;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Core
{
    public static class RoomItemExtensions
    {
        public static string ToJsonString(this IRoomItem item)
        {
            return JsonConvert.SerializeObject(item, Formatting.Indented);
        }
    }
}
