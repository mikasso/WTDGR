using Backend.Core;
using Backend.Models;
using Backend.Models.RoomItems;
using Serilog;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Backend.Core
{
    public class RoomManager : IRoomManager
    {
        public string RoomId { get; init; }


        private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1);
        public RoomManager(string id)
        {
            Log.Information($"Starting new room. Id: {id}");
            RoomId = id;
        }
        public User Owner { get; private set; }
        public readonly UsersManager Users = new();
        public readonly VerticesManager _verticesManager = new();
        public User CreateOwner(User owner)
        {
            if (Owner != default)
                throw new Exception("Owner already exists!");
            owner.Role = UserRoles.Owner;
            owner.RoomId = RoomId;
            Owner = owner;
            return owner;
        }

        public async Task<bool> ExecuteAction(UserAction userAction)
        {
            try
            {
                var action = DispatchAction(userAction);
                await _semaphore.WaitAsync();
                try
                {
                    return action();
                }
                finally
                {
                    _semaphore.Release();
                }
            }
            catch (Exception e)
            {
                Log.Error("Cannot dispatch user action message!", e);
                return false;
            }
        }

        public Func<bool> DispatchAction(UserAction userAction)
        {
            Log.Information($"Dispatching Action, Room Id: {RoomId}, Action type:{userAction.ActionType}\n{userAction.Item.ToJsonString()}");
            switch (userAction.ActionType)
            {
                case "Add":
                    userAction.Item.Id = Guid.NewGuid().ToString();
                    return DispatchAddAction(userAction);
                    break;
                case "Edit":
                    return DispatchEditAction(userAction);
                    break;
                case "Delete":
                    return DispatchDeleteAction(userAction);
                    break;
                default:
                    throw new ArgumentException("Cannot dispatch user action message!");
            }
        }

        private Func<bool> DispatchDeleteAction(UserAction userAction)
        {
            switch (userAction.Item.Type)
            {
                case "v-circle":
                    var vertexId = userAction.Item.Id;
                    return () => _verticesManager.Delete(vertexId);
                default: throw new NotImplementedException();
            }
        }

        private Func<bool> DispatchEditAction(UserAction userAction)
        {
            switch (userAction.Item.Type)
            {
                case "v-circle":
                    return () => _verticesManager.Update(userAction.Item as Vertex);
                default: throw new NotImplementedException();
            }
        }

        public Func<bool> DispatchAddAction(UserAction userAction)
        {
            switch (userAction.Item.Type)
            {
                case "v-circle":
                    var vertex = userAction.Item as Vertex;
                    return () => _verticesManager.Add(vertex);
                default: throw new NotImplementedException();
            }
        }
    }
}
