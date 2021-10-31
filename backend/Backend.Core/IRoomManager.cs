using Backend.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Core
{
    public interface IRoomManager
    {
        string RoomId { get; }
        IRoomUsersManager Users { get; }
        IAsyncEnumerable<ActionResult> HandleUserDisconnectAsync(string userId);
        DateTime LastEditTimeStamp { get; }
        IList<IRoomItem> GetRoomImage();
        Task<ActionResult> ExecuteActionAsync(UserAction userAction);
    }
}