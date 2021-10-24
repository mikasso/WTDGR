using Backend.Core;
using Backend.Models;
using Backend.Models.RoomItems;
using Serilog;
using System;
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
        private readonly PencilManager _pencilManager = new PencilManager();

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
                PencilLines = _pencilManager.GetAll().Cast<PencilLine>().ToList(),
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
            Log.Information($"Dispatching Action, Room Id: {RoomId}, Action type:{userAction.ActionType}\n{userAction.Item.ToJsonString()}");
            if(!IsItemFree(userAction))
            {
                throw new ItemLockedException();
            }

            var item = userAction.Item;
            var itemManager = DispatchItemManager(item.Type);

            switch (userAction.ActionType)
            {
                case ActionType.Add:
                    if(item.Id == null)
                        item.Id = Guid.NewGuid().ToString();
                    return () => itemManager.Add(item);
                case ActionType.RequestToEdit:
                    item.EditorId = userAction.UserId;
                    return () => itemManager.Update(item);
                case ActionType.ReleaseItem:
                    item.EditorId = null;
                    return () => itemManager.Update(item);
                case ActionType.Edit:
                    return () => itemManager.Update(item);
                case ActionType.Delete:
                    return () => itemManager.Delete(item.Id);
                default:
                    throw new ArgumentException("Cannot dispatch user action message!");
            }
        }

        private bool IsItemFree(UserAction userAction)
        {
            if (userAction.Item.Type != KonvaType.Vertex) return true;

            var itemId = userAction.Item.Id;
            if (userAction.ActionType == ActionType.Add)
                return true;
            var vertex = _verticesManager.Get(itemId);
            if (vertex == null)
                return true;
            if (vertex.EditorId == null)
                return true;
            return vertex.EditorId == userAction.UserId;
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
                KonvaType.PencilLine => _pencilManager,
                _ => throw new NotImplementedException(),
            };
        }



    }
}
