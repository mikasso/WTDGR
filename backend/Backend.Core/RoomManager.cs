using Backend.Core;
using Backend.Models;
using Backend.Models.RoomItems;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Backend.Core
{
    public class RoomManager : IRoomManager
    {
        public string RoomId { get; init; }
        public User Owner { get; private set; }

        public readonly UsersManager Users = new();

        private readonly EdgeManager _edgeManager;
        private readonly VerticesManager _verticesManager;
        private readonly LayersManager _layersManager = new LayersManager();
        private readonly LineManager _lineManager = new LineManager();

        private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1);
        public RoomManager(string id)
        {
            Log.Information($"Starting new room. Id: {id}");
            RoomId = id;
            _layersManager.Add(new Layer() { Id = "Layer 1", Type = KonvaType.Layer });
            _verticesManager = new();
            _edgeManager = new(_verticesManager);
            _verticesManager.Initialize(_edgeManager);
        }
        public User CreateOwner(User owner)
        {
            if (Owner != default)
                throw new Exception("Owner already exists!");
            owner.Role = UserRoles.Owner;
            owner.RoomId = RoomId;
            Owner = owner;
            return owner;
        }

        public async Task<RoomImage> GetRoomImage()
        {
            return new RoomImage()
            {
                Vertices = _verticesManager.GetAll().Cast<Vertex>().ToList(),
                Edges = _edgeManager.GetAll().Cast<Edge>().ToList(),
                Layers = _layersManager.GetAll().Cast<Layer>().ToList(),
            };
        }

        public async Task<ActionResult> ExecuteAction(UserAction userAction)
        {
            var actionResult = new ActionResult() { IsSucceded = false, Receviers = Receviers.caller };
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
                actionResult.Receviers = DispatchReceivers(actionResult.IsSucceded, userAction.ActionType);
                actionResult.UserAction = userAction;
                return actionResult;
            }
            catch (ItemLockedException)
            {
                Log.Information("Cannot execute user acrtion because the item is currently locked");
                return actionResult;
            }
            catch (Exception e)
            {
                Log.Error("Cannot dispatch user action message! \n" + e.StackTrace);
                return actionResult;
            }

        }

        private Func<bool> DispatchAction(UserAction userAction)
        {
            var items = userAction.Items;
            var userId = userAction.UserId;
            var actions = new List<Func<bool>>();
            foreach (var item in items)
            {
                Log.Information($"Dispatching Action, Room Id: {RoomId}, Action type:{userAction.ActionType}\n{item.ToJsonString()}");

                void throwIfNotFree(IRoomItem item, string userId)
                {
                    if (!IsItemFree(item, userId))
                    {
                        throw new ItemLockedException();
                    }
                }

                var itemManager = DispatchItemManager(item.Type);

                switch (userAction.ActionType)
                {
                    case ActionType.Add:
                        if (item.Id == null)
                            item.Id = Guid.NewGuid().ToString();
                        actions.Add(() => { throwIfNotFree(item, userId); return itemManager.Add(item); });
                        break;
                    case ActionType.RequestToEdit:
                        item.EditorId = userAction.UserId;
                        actions.Add(() => { throwIfNotFree(item, userId); return itemManager.Update(item); });
                        break;
                    case ActionType.ReleaseItem:
                        item.EditorId = null;
                        actions.Add(() => { throwIfNotFree(item, userId); return itemManager.Update(item); });
                        break;
                    case ActionType.Edit:
                        actions.Add(() => { throwIfNotFree(item, userId); return itemManager.Update(item); });
                        break;
                    case ActionType.Delete:
                        actions.Add(() => { throwIfNotFree(item, userId); return itemManager.Delete(item.Id); });
                        break;
                    default:
                        actions.Add(() => throw new ArgumentException("Cannot dispatch user action message!"));
                        break;
                }
            }
            return () => actions.All(action => action());
        }


        private bool IsItemFree(IRoomItem item, string userId)
        {
            if (item.Type != KonvaType.Vertex) return true;

            var itemId = item.Id;
            var vertex = _verticesManager.Get(itemId);
            if (vertex == null)
                return true;
            if (vertex.EditorId == null)
                return true;
            return vertex.EditorId == userId;
        }
        private Receviers DispatchReceivers(bool isSucceded, ActionType actionType)
        {
            return actionType switch
            {
                _ => isSucceded ? Receviers.all : Receviers.caller,
            };
        }

        private IRoomItemsManager DispatchItemManager(KonvaType konvaType)
        {
            return konvaType switch
            {
                KonvaType.Vertex => _verticesManager,
                KonvaType.Layer => _layersManager,
                KonvaType.Edge => _edgeManager,
                KonvaType.Line => _lineManager,
                _ => throw new NotImplementedException(),
            };
        }



    }
}
