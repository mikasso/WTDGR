using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace backend.Hubs
{
    public class GraphHub : Hub
    {
        private IRoomService RoomService { get; }
        private IUserService UserService { get; }

        private IClientProxy RoomUsers(User user)
        {
            return Clients.Group(user.RoomId);
        }

        public GraphHub(IRoomService roomService, IUserService userService)
        {
            RoomService = roomService;
            UserService = userService;
        }

        public async Task JoinRoom(User user)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, user.RoomId);
            await RoomUsers(user).SendAsync("Send", $"{user.Username}:  has joined the room {user.RoomId}.");
        }

        public async Task LeaveRoom(User user)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, user.RoomId);
            await RoomUsers(user).SendAsync("Send", $"{Context.ConnectionId} has left the group {user.RoomId}.");
        }

        public async Task SendMessage(string roomId,string username ,string message)
        {
            await Clients.Group(roomId).SendAsync("Send", username, message);
        }
    }
}
