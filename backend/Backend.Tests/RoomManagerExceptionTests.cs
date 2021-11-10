using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Backend.Core;
using Backend.Models;
using Backend.Models.RoomItems;
using FluentAssertions;

namespace Backend.Tests
{
    public class RoomManagerExceptionTests : RoomManagerTestWithMocks
    {
        private const string userId = "User1";


        [Fact]
        public async Task Room_ShouldThrow_WhenRequestToEditItemIsAlreadyBeingEdited()
        {
            var itemId = "Vertex_1";
            var vertex = new Vertex()
            {
                Id = itemId,
                Type = KonvaType.Vertex,
                EditorId = "Someone",
            };
            _verticesManagerMock.Setup(x => x.Get(itemId)).Returns(vertex);
            _userManagerMock.Setup(x => x.CanEdit(userId)).Returns(true);
            var sut = GetSut();
            
            var action = BuildAction(userId, ActionType.RequestToEdit, vertex);
            
            await Assert.ThrowsAsync<ItemLockedException>( async () => await sut.ExecuteActionAsync(action));
        }

        [Fact]
        public async Task Room_ShouldThrow_WhenMessageHasEmptyItem()
        {
            _userManagerMock.Setup(x => x.CanEdit(userId)).Returns(true);
            var sut = GetSut();
            var action = BuildAction(userId, ActionType.RequestToEdit, new Vertex() { });
            await Assert.ThrowsAsync<ItemDoesNotExistException>(async () => await sut.ExecuteActionAsync(action));
        }

        [Fact]
        public async Task ActionResult_ShouldBeNotSucceded_WhenUserCannotEdit()
        {
            _userManagerMock.Setup(x => x.CanEdit(userId)).Returns(false);
            var sut = GetSut();
            var addVertex = BuildAction(userId, ActionType.Add, new Vertex()); 
            var result = await sut.ExecuteActionAsync(addVertex);
            result.IsSucceded.Should().Be(false);
        }
    }
}
