using Backend.Models;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System;
using Serilog;
using Backend.Core;
using System.Collections.Generic;

namespace Backend.Service
{

    public interface IGraphHub
    {
        Task SendAction(UserAction userAction);
        Task ReceiveAction(UserAction userAction, bool isSucceded = true);
        Task ReceiveActionResponse(UserActionFailure actionResponse);
        Task ReceiveRoomId(string roomId);
        Task ReceiveText(string message);
        Task ReceiveWarninig(string message);
        Task ReceiveJoinResponse(User user);
        Task ReceiveGraph(IList<IRoomItem> items);
        Task GetGraph();
    }

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
                await AssignUserToContext(user);
                await ReplyForJoin(user);
            }
            else
            {
                Context.Abort();
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
            if (Room != null && MyUser != null)
            {
                var additionalInfo = exception == null ? " No exception catched." : exception.Message;
                Log.Information($"User {MyUser.Id} has disconnected from room:{Room.RoomId} due to\n {additionalInfo}");
                var actionResults = Room.HandleUserDisconnectAsync(MyUser.Id);
                await foreach (ActionResult actionResult in actionResults)
                {
                    await HandleReceiveActionResult(actionResult, MyUser.Id);
                }
                Room.Users.Delete(MyUser.Id);
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
            Log.Information($"Received action.");
            userAction.UserId = MyUser.Id;
            if (MyGroup == null)
            {
                await Clients.Caller.ReceiveActionResponse(new UserActionFailure() { Reason = "You are not in any room!" });
                return;
            }
            var actionResult = await Room.ExecuteActionAsync(userAction);
            await HandleReceiveActionResult(actionResult, userAction.UserId);
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
                Log.Error($"Cannot execute action for user {userId}\n");
            }
        }

        private async Task<bool> AssignUserToContext(User user)
        {
            MyUser = user;
            await Groups.AddToGroupAsync(Context.ConnectionId, user.RoomId);
            MyGroup = Clients.Group(user.RoomId);
            return Room.Users.Add(user);
        }

        private async Task ReplyForJoin(User user)
        {
            var message = $"{MyUser.Id}:  has joined the room {MyUser.RoomId}.";
            await MyGroup.ReceiveText(message);
            Log.Information(message);
            await Clients.Caller.ReceiveJoinResponse(user);
        }

        private async Task<bool> CanJoinToRoom(User user)
        {
            try
            {
                var room = _roomsContainer.GetRoom(user.RoomId);
                var alreadyExist = room.Users.Exists(user.Id);
                if (alreadyExist)
                {
                    Log.Information($"User already exists in this room, id: {user.Id}");
                    await Clients.Caller.ReceiveWarninig($"You cannot join this room, there is already {user.Id} in the room.");
                }
                return (alreadyExist == false);
            }
            catch (Exception e)
            {
                Log.Error(e, $"User: {user.Id} failed to connect to room: {user.RoomId} The room doesnt exists");
                await Clients.Caller.ReceiveWarninig($"You cannot join this room. The room doesnt exists.");
                return false;
            }
        }
    }
}
