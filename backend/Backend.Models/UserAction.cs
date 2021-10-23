using Newtonsoft.Json.Converters;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class UserAction
    {
        public ActionType ActionType { get; set; }
        [JsonConverter(typeof(RoomItemConverter))]
        public IList<IRoomItem> Items { get; set; }
        public string UserId { get; set; }
    }
}