using System.Collections.Generic;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public string Username { get; set; }
      //  public string Role { get; set; }
       // public string RoomId { get; set; }

        [JsonIgnore]
        public List<string> RefreshTokens { get; set; }
    }
}
