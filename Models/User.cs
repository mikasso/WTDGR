using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models
{
    public class UserRoles
    {
        public const string Owner = "Owner";
        public const string User = "User";
        public const string Admin = "Admin";
    }

    public class User : IName
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Name { get; set; }
        [BsonRequired]
        public string Role { get; set; } 
        [BsonRequired]
        public string RoomId { get; set; }
    }
}
