using Backend.Core;
using Backend.Models;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Tests
{
    public class RoomManagerTestWithMocks
    {
        protected Mock<ITimeProvider> _timeProviderMock;
        protected Mock<IRoomUsersManager> _userManagerMock;
        protected Mock<IRoomItemsManager> _verticesManagerMock;
        protected Mock<IRoomItemsManager> _edgeManagerMock;
        protected Mock<IRoomItemsManager> _lineManagerMock;
        protected Mock<IRoomItemsManager> _layersManagerMock;
        protected Mock<IRoomItemsManager> _pencilManagerMock;
        public RoomManagerTestWithMocks()
        {
            _timeProviderMock = new Mock<ITimeProvider>();
            _userManagerMock = new Mock<IRoomUsersManager>();
            _verticesManagerMock = new Mock<IRoomItemsManager>();
            _edgeManagerMock = new Mock<IRoomItemsManager>();
            _lineManagerMock = new Mock<IRoomItemsManager>();
            _layersManagerMock = new Mock<IRoomItemsManager>();
            _pencilManagerMock = new Mock<IRoomItemsManager>();
        }

        protected RoomManager GetSut()
        {
            return new RoomManager("1",
                _timeProviderMock.Object,
                _userManagerMock.Object,
                _verticesManagerMock.Object,
                _edgeManagerMock.Object,
                _lineManagerMock.Object,
                _layersManagerMock.Object,
                _pencilManagerMock.Object);
        }

        protected UserAction BuildAction(string userId, ActionType actionType, params IRoomItem[] items)
        {
            return new UserAction()
            {
                ActionType = ActionType.RequestToEdit,
                Items = items.ToArray(),
                UserId = userId
            };
        }

    }
}

