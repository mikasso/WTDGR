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
            _roomManager.Users.Add(new User() { Id = "User1" });
            _roomManager.Users.Add(new User() { Id = "User2" });
        }

        [Fact]
        public async Task RoomShouldContain1VertexAfterAddAction()
        {
            var userAction = new UserAction()
            {
                ActionType = ActionType.Add,
                Item = new Vertex() { Type = KonvaType.Vertex },
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

        [Fact]
        public async Task ShouldConnectVerticesWhenLayOnTheSameLayer()
        {
            var vertex1Id = await AddVertex("User1");
            var vertex2Id = await AddVertex("User1");
            var addEdgeResult = await AddEdge("User1", vertex1Id, vertex2Id);
            addEdgeResult.IsSucceded.Should().Be(true);
            var roomImage = await _roomManager.GetRoomImage();
            roomImage.Edges.Count.Should().Be(1);
        }

        [Fact]
        public async Task ShouldDisallowConnectTheSameVertex()
        {
            var vertex1Id = await AddVertex("User1");
            var addEdgeResult = await AddEdge("User1", vertex1Id, vertex1Id);
            addEdgeResult.IsSucceded.Should().Be(true);
            var roomImage = await _roomManager.GetRoomImage();
            roomImage.Edges.Count.Should().Be(1);
        }

        [Fact]
        public async Task ShouldDisallowConnectVerticesThatAreNotOnTheSameLayer()
        {
            var vertex1Id = await AddVertex("User1");
            var addLayerResult = await AddLayer("User1");
            addLayerResult.IsSucceded.Should().Be(true);
            addLayerResult.UserAction.Item.Id.Should().Be("Layer 2");
            var vertex2Id = await AddVertex("User1", "Layer 2");
            var addEdgeResult = await AddEdge("User1", vertex1Id, vertex2Id);
            addEdgeResult.IsSucceded.Should().Be(false);
        }

        [Fact]
        public async Task ShouldAddLine()
        {
            var vertex1Id = await AddVertex("User1");
            var addLayerResult = await AddLine("User1", vertex1Id);
            addLayerResult.IsSucceded.Should().Be(true);
        }

        [Fact]
        public async Task ShouldEditLine()
        {
            var vertex1Id = await AddVertex("User1");
            var addLineResult = await AddLine("User1", vertex1Id);
            addLineResult.IsSucceded.Should().Be(true);
            var editAction = new UserAction()
            {
                ActionType = ActionType.Edit,
                Item = new Line()
                {
                    Type = KonvaType.Line,
                    Id = addLineResult.UserAction.Item.Id,
                    Layer = "Layer 1",
                    V1 = vertex1Id,
                    Points = new[] { 1, 2, 3, 4 },
                },
                UserId = "User1",
            };
            var editResult = await _roomManager.ExecuteAction(editAction);
            editResult.IsSucceded.Should().BeTrue();
        }

        [Fact]
        public async Task ShouldDeleteLine()
        {
            var vertex1Id = await AddVertex("User1");
            var addLineResult = await AddLine("User1", vertex1Id);
            addLineResult.IsSucceded.Should().Be(true);
            var deleteLineAction = new UserAction()
            {
                ActionType = ActionType.Delete,
                Item = new Line()
                {
                    Type = KonvaType.Line,
                    Id = addLineResult.UserAction.Item.Id,
                },
                UserId = "User1",
            };
            var editResult = await _roomManager.ExecuteAction(deleteLineAction);
            editResult.IsSucceded.Should().BeTrue();
        }

        private async Task<string> AddVertex(string userId, string layerId = "Layer 1")
        {
            var addAction = new UserAction()
            {
                ActionType = ActionType.Add,
                Item = new Vertex() { Type = KonvaType.Vertex, Layer = layerId },
                UserId = userId,
            };
            var addResult = await _roomManager.ExecuteAction(addAction);
            addResult.IsSucceded.Should().BeTrue();
            return addResult.UserAction.Item.Id;
        }

        private async Task<ActionResult> AddLine(string userId, string v1, string layerId = "Layer 1")
        {
            var addAction = new UserAction()
            {
                ActionType = ActionType.Add,
                Item = new Line() { Type = KonvaType.Line, Layer = layerId, V1 = v1 },
                UserId = userId,
            };
            return await _roomManager.ExecuteAction(addAction);
        }

        private async Task<ActionResult> AddEdge(string userId, string v1, string v2)
        {
            var addAction = new UserAction()
            {
                ActionType = ActionType.Add,
                Item = new Edge() { Type = KonvaType.Edge, V1 = v1, V2 = v2 },
                UserId = userId,
            };
            return await _roomManager.ExecuteAction(addAction);
        }

        private async Task<ActionResult> AddLayer(string userId)
        {
            var addLayerAction = new UserAction()
            {
                ActionType = ActionType.Add,
                Item = new Layer() { Id = "anything", Type = KonvaType.Layer },
                UserId = "User1"
            };
            return await _roomManager.ExecuteAction(addLayerAction);
        }
    }
}
