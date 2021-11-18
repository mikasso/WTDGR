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


namespace Backend.Tests
{
    public class RoomManagerTests : RoomManagerTestsBase
    {


        [Fact]
        public async Task RoomShouldContain1VertexAfterAddAction()
        {
            var userAction = new UserAction()
            {
                ActionType = ActionType.Add,
                Items = new List<IRoomItem>() { new Vertex() { Type = KonvaType.Vertex } },
                UserId = "User1"
            };

            var result = await _roomManager.ExecuteActionAsync(userAction);
            var roomImage =  _roomManager.GetRoomImage();

            result.IsSucceded.Should().BeTrue();
            result.Receviers.Should().Be(Receviers.All);
            result.UserAction.Should().BeEquivalentTo(userAction);
            roomImage.Where(x => x.Type == KonvaType.Vertex).Should().ContainSingle();
        }

        [Fact]
        public async Task RoomShouldContainNoVertexAfterDeleteTheLastOne()
        {
            var addAction = new UserAction()
            {
                ActionType = ActionType.Add,
                Items = new List<IRoomItem>() { new Vertex() { Type = KonvaType.Vertex } },
                UserId = "User1"
            };

            var addResult = await _roomManager.ExecuteActionAsync(addAction);
            addResult.IsSucceded.Should().BeTrue();
            var vertexId = addResult.UserAction.Items.First().Id;
            var deleteAction = new UserAction()
            {
                ActionType = ActionType.Delete,
                Items = new List<IRoomItem>() { new Vertex() { Id = vertexId, Type = KonvaType.Vertex } },
                UserId = "User1"
            };
            var deleteResult = await _roomManager.ExecuteActionAsync(deleteAction);
            var roomImage = _roomManager.GetRoomImage();

            deleteResult.IsSucceded.Should().BeTrue();
            deleteResult.Receviers.Should().Be(Receviers.All);
            deleteResult.UserAction.Should().BeEquivalentTo(deleteAction);
            roomImage.Where(x=>x.Type!=KonvaType.Layer).Should().BeEmpty();
        }

        [Fact]
        public async Task EditShouldNotChangeEditor()
        {
            var vertexId = await AddVertexToId();
            var requestAction = new UserAction()
            {
                ActionType = ActionType.RequestToEdit,
                Items = new List<IRoomItem>() { new Vertex() { Id = vertexId, Type = KonvaType.Vertex } },
                UserId = "User1"
            };
            var requestResult = await _roomManager.ExecuteActionAsync(requestAction);
            requestResult.IsSucceded.Should().Be(true);

            var editAction = new UserAction()
            {
                ActionType = ActionType.Edit,
                Items = new List<IRoomItem>() { new Vertex() { Id = vertexId, Type = KonvaType.Vertex, EditorId=null } },
                UserId = "User1"
            };
            var editResult = await _roomManager.ExecuteActionAsync(editAction);
            var vertex = (_roomManager.GetRoomImage()).Where(x => x.Type == KonvaType.Vertex).FirstOrDefault();
            editResult.IsSucceded.Should().Be(true);
            vertex.EditorId.Should().Be("User1");

        }

        [Fact]
        public async Task ShouldConnectVerticesWhenLayOnTheSameLayer()
        {
            var vertex1Id = await AddVertexToId();
            var vertex2Id = await AddVertexToId();
            var addEdgeResult = await AddEdge("User1", vertex1Id, vertex2Id);
            addEdgeResult.IsSucceded.Should().Be(true);
            var edges = _roomManager.GetRoomImage().Where(x => x.Type == KonvaType.Edge).ToList();
            edges.Count.Should().Be(1);
        }

        [Fact]
        public async Task ShouldDisallowConnectTheSameVertex()
        {
            var vertex1Id = await AddVertexToId("User1");
            var addEdgeResult = await AddEdge("User1", vertex1Id, vertex1Id);
            addEdgeResult.IsSucceded.Should().Be(false);
            var edges = _roomManager.GetRoomImage().Where(x => x.Type == KonvaType.Edge).ToList();
            edges.Should().BeEmpty();
        }

        [Fact]
        public async Task ShouldDisallowConnectVerticesThatAreNotOnTheSameLayer()
        {
            var vertex1Id = await AddVertexToId("User1");
            var addLayerResult = await AddLayer("User1");
            addLayerResult.IsSucceded.Should().Be(true);
            addLayerResult.UserAction.Items.First().Id.Should().Be("Layer 2");
            var vertex2Id = (await AddVertex("User1", "Layer 2")).UserAction.Items.First().Id;
            var addEdgeResult = await AddEdge("User1", vertex1Id, vertex2Id);
            addEdgeResult.IsSucceded.Should().Be(false);
        }

        [Fact]
        public async Task ShouldNotConnectTheSameVerticesTwice()
        {
            var vertex1Id = await AddVertexToId("User1");
            var vertex2Id = await AddVertexToId("User2");
            var addEdgeResult1 = await AddEdge("User1", vertex1Id, vertex2Id);
            var addEdgeResult2 = await AddEdge("User1", vertex1Id, vertex2Id);
            var addEdgeResult3 = await AddEdge("User2",  vertex2Id,vertex1Id);
            addEdgeResult1.IsSucceded.Should().Be(true);
            addEdgeResult2.IsSucceded.Should().Be(false);
            addEdgeResult3.IsSucceded.Should().Be(false);
        }

        [Fact]
        public async Task ShouldAddLine()
        {
            var vertex1Id = await AddVertexToId();
            var addLayerResult = await AddLine("User1", vertex1Id);
            addLayerResult.IsSucceded.Should().Be(true);
        }

        [Fact]
        public async Task ShouldEditLine()
        {
            var vertex1Id = await AddVertexToId("User1");
            var addLineResult = await AddLine("User1", vertex1Id);
            addLineResult.IsSucceded.Should().Be(true);
            var editAction = new UserAction()
            {
                ActionType = ActionType.Edit,
                Items = new List<IRoomItem>() {  new Line()
                {
                    Type = KonvaType.Line,
                    Id = addLineResult.UserAction.Items.First().Id,
                    Layer = "Layer 1",
                    V1 = vertex1Id,
                    Points = new[] { 1, 2, 3, 4 },
                } } ,
                UserId = "User1",
            };
            var editResult = await _roomManager.ExecuteActionAsync(editAction);
            editResult.IsSucceded.Should().BeTrue();
        }

        [Fact]
        public async Task ShouldDeleteLine()
        {
            var vertex1Id = await AddVertexToId("User1");
            var addLineResult = await AddLine("User1", vertex1Id);
            addLineResult.IsSucceded.Should().Be(true);
            var deleteLineAction = new UserAction()
            {
                ActionType = ActionType.Delete,
                Items = new List<IRoomItem>() { new Line()
                {
                    Type = KonvaType.Line,
                    Id = addLineResult.UserAction.Items.First().Id,
                } },
                UserId = "User1",
            };
            var editResult = await _roomManager.ExecuteActionAsync(deleteLineAction);
            editResult.IsSucceded.Should().BeTrue();
        }

        [Fact]
        public async Task NoItemShouldRestAfterDeletingLastLayer()
        {
            var vertex1Id = await AddVertexToId("User1");
            var vertex2Id = await AddVertexToId("User1");
            await AddEdge("User1", vertex1Id, vertex2Id);
            
            var deleteLayer = new UserAction()
            {
                ActionType = ActionType.Delete,
                Items = new List<IRoomItem>() { new Layer() { Type = KonvaType.Layer, Id = "Layer 1"} },
                UserId = "User1",
            };

            var deleteResult = await _roomManager.ExecuteActionAsync(deleteLayer);
            deleteResult.IsSucceded.Should().BeTrue();
            var image =  _roomManager.GetRoomImage().ToList();
            image.Should().HaveCount(0);
        }
    }
}
