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

        public async Task<ActionResult> ExecuteAction(UserAction userAction)
        {
            var actionResult = new ActionResult() { IsSucceded = false, Receviers = Receviers.caller};
            try
            {
                var action = DispatchAction(userAction);
                await _semaphore.WaitAsync();
                try
                {
                    actionResult.IsSucceded = action();
                }
                finally
                {
                    _semaphore.Release();
                }
                actionResult.Receviers = dispatchReceivers(actionResult.IsSucceded, userAction.ActionType);
                actionResult.UserAction = userAction;
                return actionResult;
            }
            catch (Exception e)
            {
                Log.Error("Cannot dispatch user action message!", e);
                return actionResult;
            }

        }

        private Receviers dispatchReceivers(bool isSucceded, string actionType)
        {
            switch (actionType) { 
                case "RequestToEdit":
                case "ReleaseItem":
                    return Receviers.caller;
                default:
                    if (isSucceded)
                        return Receviers.all;
                    else
                        return Receviers.caller;
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
                case "RequestToEdit":
                    return DispatchRequestToEditAction(userAction);
                case "ReleaseItem":
                    return DispatchReleaseItemAction(userAction);
                case "Edit":
                    return DispatchEditAction(userAction);
                case "Delete":
                    return DispatchDeleteAction(userAction);
                default:
                    throw new ArgumentException("Cannot dispatch user action message!");
            }
        }

        private Func<bool> DispatchReleaseItemAction(UserAction userAction)
        {
            switch (userAction.Item.Type)
            {
                case "v-circle":
                    var item = userAction.Item as Vertex;
                    item.EditorId = null;
                    return () => _verticesManager.Update(item);
                default: throw new NotImplementedException();
            }
        }

        private Func<bool> DispatchRequestToEditAction(UserAction userAction)
        {
            switch (userAction.Item.Type)
            {
                case "v-circle":
                    var item = userAction.Item as Vertex;
                    item.EditorId = userAction.UserId;
                    return () => _verticesManager.Update(item);
                default: throw new NotImplementedException();
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
