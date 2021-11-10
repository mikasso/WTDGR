using Backend.Models;
using Backend.Models.RoomItems;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
namespace Backend.Tests
{
    public class RoomManagerDisconnectTests : RoomManagerTestWithMocks
    {
        private const string userId = "User1";
        public RoomManagerDisconnectTests()
        {
            _userManagerMock.Setup(x => x.CanEdit(userId)).Returns(false);
            _edgeManagerMock.Setup(x => x.GetAll()).Returns(new List<IRoomItem>());
            _lineManagerMock.Setup(x => x.GetAll()).Returns(new List<IRoomItem>());
            _pencilManagerMock.Setup(x => x.GetAll()).Returns(new List<IRoomItem>());
            _verticesManagerMock.Setup(x => x.GetAll()).Returns(new List<IRoomItem>());
        }
        private async Task<IList<ActionResult>> ResultsToList(IAsyncEnumerable<ActionResult> actionResultsAsync)
        {
            List<ActionResult> results = new();
            await foreach (var result in actionResultsAsync)
            {
                results.Add(result);
            }
            return results;
        }
        [Fact]
        public async Task ShouldRemoveUserTemporaryLineWhenUserDisconnect()
        {
            _lineManagerMock.Setup(x => x.GetAll()).Returns(new List<IRoomItem> { new Line() { Id = "1", EditorId = userId } });
            var sut = GetSut();
            
            var results = sut.HandleUserRevokeEditor(userId);
            
            results.Should().HaveCount(1);
            results.Select(x => x.Items.FirstOrDefault()).FirstOrDefault().Id.Should().Be("1");
            results.All(x => x.UserId == userId).Should().BeTrue();
        }

        [Fact]
        public async Task ShouldReleaseUserEdgesAndVerticesWhenUserDisconnect()
        {
            _verticesManagerMock.Setup(x => x.GetAll()).Returns(new List<IRoomItem>() 
            {
                new Vertex { Id = "vertex_1", EditorId = userId, Layer = "Layer 1", Type = KonvaType.Vertex },
                new Vertex { Id = "vertex_2", EditorId = userId, Layer = "Layer 1", Type = KonvaType.Vertex } 
            });
            _edgeManagerMock.Setup(x => x.GetAll()).Returns(new List<IRoomItem>()
            {
                 new Edge { Id = "edge_1", EditorId = userId, Layer = "Layer 1", Type = KonvaType.Edge },
            });
            var sut = GetSut();
           
            var results = sut.HandleUserRevokeEditor(userId);
            
            results.Should().HaveCount(1);
            var receivedAction = results.First();
            receivedAction.ActionType.Should().Be(ActionType.ReleaseItem);
            receivedAction.Items.Select(x => x.Id).Should()
                .BeEquivalentTo(new List<string>() { "vertex_1", "vertex_2", "edge_1"});
            results.All(x => x.UserId == userId).Should().BeTrue();
        }


        [Fact]
        public async Task ShouldReleasPencilLineWhenUserDisconnect()
        {
            _pencilManagerMock.Setup(x => x.GetAll()).Returns(new List<IRoomItem>()
            {
                new PencilLine { Id = "pencil_1", EditorId = userId, Layer = "Layer 1", Type = KonvaType.PencilLine },
            });
            var sut = GetSut();

            var results = sut.HandleUserRevokeEditor(userId);

            results.Should().HaveCount(1);
            var receivedAction = results.First();
            receivedAction.ActionType.Should().Be(ActionType.ReleaseItem);
            receivedAction.Items.Select(x => x.Id).Should()
                .BeEquivalentTo(new List<string>() { "pencil_1" });
            results.All(x => x.UserId == userId).Should().BeTrue();
        }


        [Fact]
        public async Task ShouldNoActionBePerformedWhenUserDidntEditAnything()
        {
            var sut = GetSut();
            
            var results = sut.HandleUserRevokeEditor(userId);

            results.Should().HaveCount(0);
        }
    }
}
