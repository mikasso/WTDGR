using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Service
{
    public interface IGraphHub
    {
        Task SendAction(UserAction userAction);
        Task ReceiveAction(UserAction userAction, bool isSucceded = true);
        Task ReceiveRoomId(string roomId);
        Task ReceiveWarninig(string message);
        Task ReceiveJoinResponse(bool hasJoined);
        Task ReceiveGraph(IList<IRoomItem> items);
        Task GetGraph();
        Task SetUserRole(string userId, UserRole role);
        Task GetUserList();
        Task ReceiveUsersList(IList<User> users);
    }
}
