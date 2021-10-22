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
        Task SendText(string message);
        Task ReceiveText(string message);
        Task ReceiveJoinResponse(User user);
        Task GetGraph(IList<IRoomItem> items);
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
        public async Task CreateRoom(User owner)
        {
            var roomManager = _roomsContainer.CreateRoom();
            owner = roomManager.CreateOwner(owner);
            await AssignUserToContext(owner);
            await ReplyForJoin(owner);
        }
        public async Task JoinRoom(User user)
        {
            if (CanJoinToRoom(user))
            {
                await AssignUserToContext(user);
                await ReplyForJoin(user);
            }
            else
            {
                await Clients.Caller.ReceiveText("Error: User cannot join this room");
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
                await foreach(ActionResult actionResult in actionResults)
                {
                    await HandleReceiveActionResult(actionResult,MyUser.Id);
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
                await Clients.Caller.ReceiveActionResponse(new UserActionFailure() { Reason="You re not in any group"});
            }
            var actionResult = await Room.ExecuteActionAsync(userAction);
            await HandleReceiveActionResult(actionResult, userAction.UserId);
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
            await Clients.Caller.GetGraph(Room.GetRoomImage());
        }

        private bool CanJoinToRoom(User user)
        {
            try
            {
                var room = _roomsContainer.GetRoom(user.RoomId);
                var result = room.Users.Exists(user.Id);
                if (result) Log.Information($"User already exists in this room, id: {user.Id}");
                return !result;
            }
            catch (Exception e)
            {
                Log.Error(e, $"User: {user.Id} failed to connect to room: {user.RoomId} The room doesnt exists");
                return false;
            }
        }
    }
}
