using Newtonsoft.Json.Converters;
using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class UserAction
    {
        public ActionType ActionType { get; set; }
        [JsonConverter(typeof(RoomItemConverter))]
        public IRoomItem Item { get; set; }
        public string UserId { get; set; }
    }
}