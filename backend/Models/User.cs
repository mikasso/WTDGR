using System.Collections.Generic;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models
{
    public class UserRoles
    {
        public const string Owner = "Owner";
        public const string User = "User";        
    }

    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        [BsonRequired]
        public string Username { get; set; }
        [BsonRequired]
        public string Role { get; set; } 
        [BsonRequired]
        public string RoomId { get; set; }
        [JsonIgnore]
        public List<string> RefreshTokens { get; set; }
    }
}
