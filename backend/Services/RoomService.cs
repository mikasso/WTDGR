using Backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface IRoomService
    {
        /// <summary>
        ///
        /// </summary>
        /// <param name="owener"></param>
        /// <returns>Returns Owner of the room</returns>
        public User Create(User owener);
    }

    public class RoomService : IRoomService
    {
        private readonly IMongoCollection<Room> rooms;
        private readonly IUserService userService;
        
        
        public RoomService(IDatabaseSettings settings, IUserService userService)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);
            this.userService = userService;
            rooms = database.GetCollection<Room>("rooms");
        }

        public User Create(User owner)
        {
            Room room = new Room() { Id = ObjectId.GenerateNewId().ToString() };
            owner = userService.CreateOwner(owner,room.Id);
            room.OwnerId = owner.Id;
            room.CreationTime = DateTime.UtcNow.ToString();
            rooms.InsertOne(room);
            return owner;
        }

    }
}
