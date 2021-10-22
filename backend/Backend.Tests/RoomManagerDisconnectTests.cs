using Backend.Models;
using Backend.Models.RoomItems;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
namespace Backend.Tests
{
    public class RoomManagerDisconnectTests : RoomManagerTestsBase
    {
        public RoomManagerDisconnectTests()
        {
            _roomManager.Users.Add(new User() { Id = "User1" });
            _roomManager.Users.Add(new User() { Id = "User2" });
        }

        private async Task<IList<ActionResult>> ResultsToList(IAsyncEnumerable<ActionResult> actionResultsAsync)
        {
             List<ActionResult> results = new (); 
             await foreach (var result in actionResultsAsync)
            {
               results.Add(result);
            }
            return results;
        }
        [Fact]
        public async Task ShouldRemoveUserTemporaryLineWhenUserDisconnect()
        {
            var vertex1Id = await AddVertexToId("User1");
            var line = await AddLine("User1", vertex1Id);
            var lineId = line.UserAction.Items.FirstOrDefault().Id;
            var results =  await ResultsToList(_roomManager.HandleUserDisconnectAsync("User1"));
            results.Should().HaveCount(1);
            results.Select(x => x.UserAction.Items.FirstOrDefault()).FirstOrDefault().Id.Should().Be(lineId);
        }

        [Fact]
        public async Task ShouldReleaseUserEdgesAndVerticesWhenUserDisconnect()
        {
            var vertex1Id = await AddVertexToId("User1");
            var vertex2Id = await AddVertexToId("User1");
            var edge = await AddEdge("User1", vertex1Id, vertex2Id);
            var edgeId = edge.UserAction.Items.FirstOrDefault().Id;
            var requestToEdit = new UserAction()
            {
                ActionType = ActionType.RequestToEdit,
                Items = new List<IRoomItem>() {
                    new Edge { Id = edgeId, Layer = "Layer 1", Type = KonvaType.Edge },
                    new Vertex { Id = vertex1Id, Layer = "Layer 1", Type = KonvaType.Vertex },
                    new Vertex { Id = vertex2Id, Layer = "Layer 1", Type = KonvaType.Vertex },
                },
                UserId = "User1"
            };
            await _roomManager.ExecuteActionAsync(requestToEdit);
            var results = await ResultsToList(_roomManager.HandleUserDisconnectAsync("User1"));
            results.Should().HaveCount(1);
            var receivedAction = results.First().UserAction;
            receivedAction.ActionType.Should().Be(ActionType.ReleaseItem);
            receivedAction.Items.Select(x => x.Id).Should()
                .BeEquivalentTo(new List<string>() { edgeId , vertex1Id, vertex2Id });
        }

        [Fact]
        public async Task ShouldNoActionBePerformedWhenUserDidntEditAnything()
        {
            var results = await ResultsToList(_roomManager.HandleUserDisconnectAsync("User1"));
            results.Should().HaveCount(0);
        }
    }
}
