using Backend.Models;
using Backend.Models.RoomItems;
using Serilog;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Backend.Helpers
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
            switch (userAction.ActionType)
            {
                case "Add":
                    userAction.Item.Id = Guid.NewGuid().ToString();
                    switch (userAction.Item.Type)
                    {
                        case "v-circle":
                            Func<bool> result = () => _verticesManager.Add(userAction.Item as Vertex);
                            return result;
                        default: throw new NotImplementedException(); ;
                    }
                    break;
                case "Edit":
                    throw new NotImplementedException();
                    break;
                case "Delete":
                    throw new NotImplementedException();
                    break;
                default:
                    throw new ArgumentException("Cannot dispatch user action message!");
            }

        }
    }
}
