using Backend.Models;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Backend.Helpers;
using System;
using Backend.Models.RoomItems;
using Serilog;

namespace Backend.Hubs
{

    public interface IGraphHub
    {
        Task SendVertex(Vertex vertex);
        Task ReceiveVertex(Vertex vertex);
        Task SendText(string message);
        Task ReceiveText(string message);
        Task ReceiveJoinResponse(User user);
        Task GetGraph();
    }

    public class GraphHub : Hub<IGraphHub>
    {
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
        private RoomManager Room
        {
            get { return RoomsContainer.GetRoom(MyUser.RoomId); }
        }
        public async Task CreateRoom(User owner)
        {
            var roomManager = RoomsContainer.CreateRoom();
            owner = roomManager.CreateOwner(owner);
            await AssignUserToContext(owner);
            await ReplyForJoin(owner);
        }
        public async Task<bool> JoinRoom(User user)
        {
            if (CanJoinToRoom(user))
            {
                await AssignUserToContext(user);
                await ReplyForJoin(user);
                return true;
            }
            else
            {
                await Clients.Caller.ReceiveText("Error: User cannot join this room");
                return false;
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
            await MyGroup.ReceiveText($"{MyUser.Name}:  has joined the room {MyUser.RoomId}.");
            await Clients.Caller.ReceiveJoinResponse(user);
        }


        public async Task LeaveRoom()
        {
            Room.Users.Delete(MyUser.Name);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, MyUser.RoomId);
            await MyGroup.ReceiveText($"{Context.ConnectionId} has left the group {MyUser.RoomId}.");
        }

        public async Task SendText(string message)
        {
            await MyGroup.ReceiveText(message);
        }
        public async Task SendVertex(Vertex vertex)
        {
            Log.Debug($"Send vertex. {vertex.Name}");
            if (MyGroup == null)
            {
                await Clients.Caller.ReceiveText("You are not in any room");
                return;
            }
            vertex.Name = Room.Vertices.Count.ToString();
            Room.Vertices.Add(vertex);
            await MyGroup.ReceiveVertex(vertex);
        }

        private static bool CanJoinToRoom(User user)
        {
            try
            {
                var room = RoomsContainer.GetRoom(user.RoomId);
                return !room.Users.Exists(user.Name);
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
