using System.Text.Json.Serialization;

namespace Backend.Models
{
    public class UserAction
    {
        public string ActionType { get; set; }

        [JsonConverter(typeof(RoomItemConverter))]
        public IRoomItem Item { get; set; }
        public string UserId { get; set; }
    }
}