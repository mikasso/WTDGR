using Backend.Core;
using Backend.Models;
using Backend.Models.RoomItems;
using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Tests
{
    public abstract class RoomManagerTestsBase
    {
        protected IRoomManager _roomManager;
        protected const string _ownerId = "owner";
        public RoomManagerTestsBase()
        {
            _roomManager = new RoomManagerFactory(new TimeProvider()).CreateRoomManager();
            _roomManager.Users.CreateOwner(_ownerId);
            _roomManager.Users.Add(new User() { Id = _ownerId, Role = UserRole.Owner, RoomId = "1" });
            _roomManager.Users.Add(new User() { Id = "User1", Role = UserRole.Editor, RoomId = "1" });
            _roomManager.Users.Add(new User() { Id = "User2", Role = UserRole.Editor, RoomId = "1" });
            _roomManager.Users.SetEditor(_ownerId, "User1");
            _roomManager.Users.SetEditor(_ownerId, "User2");
        }

        protected async Task<string> AddVertexToId(string UserId = "User1")
             => (await AddVertex(UserId)).UserAction.Items.First().Id;
        protected async Task<ActionResult> AddVertex(string userId, string layerId = "Layer 1")
        {
            var addAction = new UserAction()
            {
                ActionType = ActionType.Add,
                Items = new List<IRoomItem>() { new Vertex() { Type = KonvaType.Vertex, Layer = layerId } },
                UserId = userId,
            };
            return await _roomManager.ExecuteActionAsync(addAction);
        }
        protected async Task<ActionResult> AddLine(string userId, string v1, string layerId = "Layer 1")
        {
            var addAction = new UserAction()
            {
                ActionType = ActionType.Add,
                Items = new List<IRoomItem>() { new Line() { Type = KonvaType.Line, Layer = layerId, V1 = v1 } },
                UserId = userId,
            };
            return await _roomManager.ExecuteActionAsync(addAction);
        }

        protected async Task<ActionResult> AddEdge(string userId, string v1, string v2)
        {
            var addAction = new UserAction()
            {
                ActionType = ActionType.Add,
                Items = new List<IRoomItem>() { new Edge() { Type = KonvaType.Edge, V1 = v1, V2 = v2 } },
                UserId = userId,
            };
            return await _roomManager.ExecuteActionAsync(addAction);
        }

        protected async Task<ActionResult> AddLayer(string userId)
        {
            var addAction = new UserAction()
            {
                ActionType = ActionType.Add,
                Items = new List<IRoomItem>() { new Layer() { Id = "anything", Type = KonvaType.Layer } },
                UserId = "User1"
            };
            return await _roomManager.ExecuteActionAsync(addAction);
        }

    }
}
