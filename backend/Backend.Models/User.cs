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

        public string Id { get; set; }

        public string Role { get; set; } 
        public string RoomId { get; set; }
    }
}
