using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Backend.Hubs
{

    public interface IGraphHub
    {
        Task SendVertex(Vertex message);
        Task ReceiveVertex(Vertex message);
        Task SendText(string message);
        Task ReceiveText(string message);
        Task GetGraph();
    }

    public class GraphHub : Hub<IGraphHub>
    {
        private IRoomService RoomService { get; }
        private IUserService UserService { get; }
        private User MyUser
        {
            get { return (User)Context.Items["User"]; }
            set { Context.Items.Add("User", value); }
        }
        private IGraphHub MyGroup
        {
            get { return (IGraphHub) Context.Items["Group"]; }
            set { Context.Items.Add("Group", value); }
        }
        public GraphHub(IRoomService roomService, IUserService userService)
        {
            RoomService = roomService;
            UserService = userService;
        }

        public async Task JoinRoom(User user)
        {
            if (UserService.UserExistsInRoom(user.Id, user.RoomId))
            {
                MyUser = user;
                await Groups.AddToGroupAsync(Context.ConnectionId, user.RoomId);
                MyGroup = Clients.Group(user.RoomId);
                await MyGroup.ReceiveText($"{MyUser.Username}:  has joined the room {MyUser.RoomId}.");
            }
            else 
                await Clients.Caller.ReceiveText("Error: User cannot join this room");
        }
        public async Task LeaveRoom()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, MyUser.RoomId);
            await MyGroup.ReceiveText($"{Context.ConnectionId} has left the group {MyUser.RoomId}.");
        }
        public async Task SendText(string message)
        {
            await MyGroup.ReceiveText(message);
        }
    }
}
