using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace Backend.Models
{
    public class UserRoles
    {
        public const string Owner = "Owner";
        public const string User = "User";
        public const string Admin = "Admin";
    }

    public class User : IIdentifiable
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        [BsonRequired]
        public string Role { get; set; } 
        [BsonRequired]
        public string RoomId { get; set; }
        public string Type { get => "User"; set  { throw new Exception(); } }
    }
}
