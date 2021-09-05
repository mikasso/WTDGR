using Backend.Core;
using Backend.Models;
using Backend.Models.RoomItems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;

namespace BackendTests
{
    public class RoomManagerTests
    {
        private const string roomId = "Room1";
        private RoomManager _roomManager = new RoomManager(roomId);

        public RoomManagerTests()
        {
            _roomManager.Users.AddUser(new User() { Id = "User1" });
            _roomManager.Users.AddUser(new User() { Id = "User2" });
        }

        [Fact]
        public async Task RoomShouldContain1VertexAfterAddAction()
        {
            var userAction = new UserAction()
            {
                ActionType = ActionType.Add,
                Item = new Vertex() { Type= KonvaType.Vertex },
                UserId = "User1"
            };

            var result = await _roomManager.ExecuteAction(userAction);
            var roomImage = await _roomManager.GetRoomImage();
            
            result.IsSucceded.Should().BeTrue();
            result.Receviers.Should().Be(Receviers.all);
            result.UserAction.Should().BeEquivalentTo(userAction);
            roomImage.Vertices.Should().ContainSingle();
        }

        [Fact]
        public async Task RoomShouldContainNoVertexAfterDeleteTheLastOne()
        {
            var addAction = new UserAction()
            {
                ActionType = ActionType.Add,
                Item = new Vertex() { Type = KonvaType.Vertex },
                UserId = "User1"
            };

            var addResult = await _roomManager.ExecuteAction(addAction);
            addResult.IsSucceded.Should().BeTrue();
            var vertexId = addResult.UserAction.Item.Id;
            var deleteAction = new UserAction()
            {
                ActionType = ActionType.Delete,
                Item = new Vertex() { Id = vertexId, Type = KonvaType.Vertex },
                UserId = "User1"
            };
            var deleteResult = await _roomManager.ExecuteAction(deleteAction);
            var roomImage = await _roomManager.GetRoomImage();

            deleteResult.IsSucceded.Should().BeTrue();
            deleteResult.Receviers.Should().Be(Receviers.all);
            deleteResult.UserAction.Should().BeEquivalentTo(deleteAction);
            roomImage.Vertices.Should().BeEmpty();
        }

        [Fact]
        public async Task ShouldDisallowEditVertexWhenItIsRequestBySomeoneOther()
        {
            var vertexId = await AddVertex("User1");
            var requestAction = new UserAction()
            {
                ActionType = ActionType.RequestToEdit,
                Item = new Vertex() { Id = vertexId, Type = KonvaType.Vertex },
                UserId = "User1"
            };
            var requestResult = await _roomManager.ExecuteAction(requestAction);
            requestResult.IsSucceded.Should().Be(true);
           
            var editAction = new UserAction()
            {
                ActionType = ActionType.Edit,
                Item = new Vertex() { Id = vertexId, Type = KonvaType.Vertex },
                UserId = "User2"
            };
            var editResult = await _roomManager.ExecuteAction(editAction);
            editResult.IsSucceded.Should().Be(false);
        }


        private async Task<string> AddVertex(string userId)
        {
            var addAction = new UserAction()
            {
                ActionType = ActionType.Add,
                Item = new Vertex() { Type = KonvaType.Vertex },
                UserId = "User1"
            };
            var addResult = await _roomManager.ExecuteAction(addAction);
            addResult.IsSucceded.Should().BeTrue();
            return addResult.UserAction.Item.Id;
        }
    }
}
