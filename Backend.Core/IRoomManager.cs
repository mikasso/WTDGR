using Backend.Models;
using System.Threading.Tasks;

namespace Backend.Core
{
    public interface IRoomManager
    {
        Task<ActionResult> ExecuteAction(UserAction userAction);

        User CreateOwner(User owner);
    }
}