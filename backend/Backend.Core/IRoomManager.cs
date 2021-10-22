using Backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Core
{
    public interface IRoomManager
    {
        public string RoomId {get;}
        public IRoomUsersManager Users{ get; }
        void HandleUserDisconnect(string userId);

        public IList<IRoomItem> GetRoomImage();
        Task<ActionResult> ExecuteActionAsync(UserAction userAction);
        User CreateOwner(User owner);
    }
}