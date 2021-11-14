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
        public IRoomUsersManager Users { get; init; }

        public DateTime LastEditTimeStamp { get; private set; }

        private readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1);
        private readonly IRoomItemsManager _verticesManager;
        private readonly IRoomItemsManager _edgeManager;
        private readonly IRoomItemsManager _lineManager;
        private readonly IRoomItemsManager _layersManager;
        private readonly IRoomItemsManager _pencilManager;
        private readonly ITimeProvider _timeProvider;
        public RoomManager(string id, ITimeProvider timeProvider, IRoomUsersManager usersManager, IRoomItemsManager verticesManager, IRoomItemsManager edgeManager, IRoomItemsManager lineManager, IRoomItemsManager layersManager, IRoomItemsManager pencilManager)
        {
            Log.Information($"Starting new room. Id: {id}");
            LastEditTimeStamp = timeProvider.Now();
            RoomId = id;
            Users = usersManager;
            _timeProvider = timeProvider;
            _verticesManager = verticesManager;
            _edgeManager = edgeManager;
            _lineManager = lineManager;
            _layersManager = layersManager;
            _pencilManager = pencilManager;
        }

        public IList<UserAction> HandleUserRevokeEditor(string userId)
        {
            var actionsToExcute = new List<UserAction>();
            var line = _lineManager.GetAll().FirstOrDefault(x => x.EditorId == userId);
            if (line != default)
            {
                actionsToExcute.Add(new UserAction()
                {
                    ActionType = ActionType.Delete,
                    Items = new List<IRoomItem>() { new Line() { Id = line.Id, Type = KonvaType.Line } },
                    UserId = userId,
                });
            }

            var edges = _edgeManager.GetAll().Where(x => x.EditorId == userId);
            var vertices = _verticesManager.GetAll().Where(x => x.EditorId == userId);
            var pencilLines = _pencilManager.GetAll().Where(x => x.EditorId == userId);
            var items = edges.Concat(vertices).Concat(pencilLines).ToList();
            if (items.Count > 0)
            {
                var releaseAction = new UserAction()
                {
                    ActionType = ActionType.ReleaseItem,
                    Items = items,  
                    UserId = userId,

                };
                actionsToExcute.Add(releaseAction);
            }
            return actionsToExcute;
        }

        public IList<IRoomItem> GetRoomImage()
        {
            return _layersManager.GetAll()
                .Concat(_verticesManager.GetAll())
                .Concat(_edgeManager.GetAll())
                .Concat(_lineManager.GetAll())
                .Concat(_pencilManager.GetAll())
                .ToList();
        }

        public async Task<ActionResult> ExecuteActionAsync(UserAction userAction, bool isUserActionForced = false)
        {
            LastEditTimeStamp = _timeProvider.Now();

            var actionResult = ActionResult.GetNegativeActionResult(userAction);
            if (Users.CanEdit(userAction.UserId) == false && isUserActionForced == false)
            {
                Log.Debug($"{userAction.UserId} does not have enough permission to edit the board state.");
                return actionResult;
            }
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

            actionResult.Receviers = actionResult.IsSucceded ? Receviers.All : Receviers.Caller;
            return actionResult;
        }

        private Func<bool> DispatchAction(UserAction userAction)
        {
            var items = userAction.Items;
            var userId = userAction.UserId;
            var actions = new List<Func<bool>>();
            foreach (var item in items)
            {
                Log.Debug($"Dispatching Action, Room Id: {RoomId}, User {userId}, Action type:{userAction.ActionType}\n{item.ToJsonString()}");
                var itemManager = DispatchItemManager(item.Type);
                
                void throwIfNotFree(IRoomItem item, string userId)
                {
                    var realItemState = itemManager.Get(item.Id);
                    if (realItemState == null)
                        throw new ItemDoesNotExistException("Can not do operation diffrent than add when item has no id!");
                    if (realItemState.EditorId == null)
                        return;
                    if (realItemState.EditorId != userId)
                        throw new ItemLockedException($"Item is already being edited by ${realItemState.EditorId}");
                }

                switch (userAction.ActionType)
                {
                    case ActionType.Add:
                        if (item.Id == null)
                            item.Id = Guid.NewGuid().ToString();
                        actions.Add(() => {  return itemManager.Add(item, userId); });
                        break;
                    case ActionType.RequestToEdit:
                        actions.Add(() =>
                        {
                            throwIfNotFree(item, userId);
                            item.EditorId = userId;
                            return itemManager.Update(item);
                        });
                        break;
                    case ActionType.ReleaseItem:
                        item.EditorId = null;
                        actions.Add(() => { throwIfNotFree(item, userId); return itemManager.Update(item); });
                        break;
                    case ActionType.Edit:
                        item.EditorId = userId;
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
