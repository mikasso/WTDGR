using Backend.Models;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System;
using Serilog;
using Backend.Core;
using System.Linq;

namespace Backend.Service
{
    public partial class GraphHub : Hub<IGraphHub>
    {
        private IRoomsContainer _roomsContainer;
        public GraphHub(IRoomsContainer roomsContainer)
        {
            _roomsContainer = roomsContainer;
        }
        private User MyUser
        {
            get { return (User)Context.Items["User"]; }
            set { Context.Items.Add("User", value); }
        }
        private IGraphHub MyGroup
        {
            get { return (IGraphHub)Context.Items["Group"]; }
            set { Context.Items.Add("Group", value); }
        }
        private IRoomManager? Room => MyUser != null ? _roomsContainer.GetRoom(MyUser.RoomId) : null;
        public async Task CreateRoom(string ownerId)
        {
            if (!_roomsContainer.CanCreate)
            {
                await Clients.Caller.ReceiveWarninig("Server couldnot create a room, because the rooms count hosted by the server has reached the limit");
                Context.Abort();
            }

            var roomManager = _roomsContainer.CreateRoom();
            roomManager.Users.CreateOwner(ownerId);
            await Clients.Caller.ReceiveRoomId(roomManager.RoomId);
        }
        public async Task JoinRoom(User user)
        {
            if (await CanJoinToRoom(user))
            {
                MyUser = user;
                await Groups.AddToGroupAsync(Context.ConnectionId, user.RoomId);
                MyGroup = Clients.Group(user.RoomId);
                Room.Users.Add(user);
                Log.Debug($"{user.Id}:  has joined the room {user.RoomId}.");
                await Clients.Caller.ReceiveJoinResponse(true);
                await MyGroup.ReceiveUsersList(Room.Users.GetAll());
            }
            else
            {
                Log.Debug($"{user.Id}: cannot join the room {user.RoomId}.");
                await Clients.Caller.ReceiveJoinResponse(false);
                Context.Abort();
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
            if (Room != null && MyUser != null)
            {
                var additionalInfo = exception == null ? " No exception catched." : exception.Message;
                Log.Debug($"User {MyUser.Id} has disconnected from room:{Room.RoomId} due to\n {additionalInfo}");
                var userActions = Room.HandleUserRevokeEditor(MyUser.Id);
                foreach (var userAction in userActions)
                {
                    var actionResult = await Room.ExecuteActionAsync(userAction);
                    await HandleReceiveActionResult(actionResult, MyUser.Id);
                }
                Room.Users.Delete(MyUser.Id);
                await MyGroup.ReceiveUsersList(Room.Users.GetAll());
            }
        }
        public async Task LeaveRoom()
        {
            Room.Users.Delete(MyUser.Id);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, MyUser.RoomId);
            await MyGroup.ReceiveText($"{Context.ConnectionId} has left the group {MyUser.RoomId}.");
        }

        public async Task SendText(string message)
        {
            await MyGroup.ReceiveText(message);
        }
        public async Task SendAction(UserAction userAction)
        {
            userAction.UserId = MyUser.Id;
            if (MyGroup == null)
            {
                await Clients.Caller.ReceiveActionResponse(new UserActionFailure() { Reason = "You are not in any room!" });
                return;
            }

            ActionResult actionResult = ActionResult.GetNegativeActionResult(userAction);
            try
            {
                actionResult = await Room.ExecuteActionAsync(userAction);
            }
            catch (Exception e) when (e is ItemDoesNotExistException or ItemLockedException)
            {
                Log.Debug(e.Message);
            }
            catch (Exception e)
            {
                Log.Error("Cannot dispatch user action message! \n" + e.Message + "\n" + e.StackTrace);
                await Clients.Caller.ReceiveWarninig("Unexpected error occured, please rejoin room!");
            }

            await HandleReceiveActionResult(actionResult, userAction.UserId);
        }

        public async Task SetUserRole(string userId, UserRole role)
        {
            var result = false;
            switch (role)
            {
                case UserRole.Editor:
                    result = Room.Users.SetEditor(MyUser.Id, userId);
                    break;
                case UserRole.Viewer:
                    result = Room.Users.SetViewer(MyUser.Id, userId);
                    if (result == true)
                    {
                        var userActions = Room.HandleUserRevokeEditor(userId);
                        foreach (var userAction in userActions)
                        {
                            var actionResult = await Room.ExecuteActionAsync(userAction, true);
                            await HandleReceiveActionResult(actionResult, userId);
                        }
                    }
                    break;
                default:
                    break;
            }
            if (result == true)
            {
                await MyGroup.ReceiveUsersList(Room.Users.GetAll());
                Log.Debug($"{userId} has become {role}");
            }
            else
            {
                await Clients.Caller.ReceiveWarninig($"You can not assing role: {role} that role to {userId}.");
            }
        }
        public async Task GetUsersList()
        {
            await Clients.Caller.ReceiveUsersList(Room.Users.GetAll());
        }
        public async Task GetGraph()
        {
            if (MyGroup == null)
            {
                await Clients.Caller.ReceiveActionResponse(new UserActionFailure() { Reason = "You are not in any room!" });
                return;
            }
            await Clients.Caller.ReceiveGraph(Room.GetRoomImage());
        }

        private async Task HandleReceiveActionResult(ActionResult actionResult, string userId)
        {
            var receiver = actionResult.Receviers == Receviers.all ? MyGroup : Clients.Caller;
            await receiver.ReceiveAction(actionResult.UserAction, actionResult.IsSucceded);
            if (!actionResult.IsSucceded)
            {
                Log.Debug($"Cannot execute action for user {userId}\n");
            }
        }

        private async Task<bool> CanJoinToRoom(User user)
        {
            try
            {
                var room = _roomsContainer.GetRoom(user.RoomId);
                var alreadyExist = room.Users.Exists(user.Id);
                if (alreadyExist)
                {
                    Log.Debug($"User already exists in this room, id: {user.Id}");
                    await Clients.Caller.ReceiveWarninig($"You cannot join this room, there is already {user.Id} in the room.");
                }
                return (alreadyExist == false);
            }
            catch (Exception e)
            {
                Log.Warning(e, $"User: {user.Id} failed to connect to room: {user.RoomId} The room doesnt exists");
                await Clients.Caller.ReceiveWarninig($"You cannot join this room. The room doesnt exists.");
                return false;
            }
        }
    }
}
