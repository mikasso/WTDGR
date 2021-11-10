using Backend.Models;
using Backend.Models.RoomItems;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using FluentAssertions;
using Backend.Core;
using System;
using Moq;
using Microsoft.Extensions.Configuration;

namespace Backend.Tests
{
    public class RoomContainerTests
    {
        IRoomsContainer _sut;
        ITimeProvider _timeProvider;
        DateTime _currentDate;

        public RoomContainerTests()
        {
            var timeProviderMock = new Mock<ITimeProvider>();
            _currentDate = new DateTime(2000, 1, 1, 13, 0, 0);
            timeProviderMock.Setup(x => x.Now()).Returns(() => _currentDate);
            _timeProvider = timeProviderMock.Object;
            var mockedConfig = new Mock<IConfiguration>();
            mockedConfig.Setup(x => x["RoomsLimit"]).Returns("100");
            _sut = new RoomsContainer(new RoomManagerFactory(_timeProvider), _timeProvider, mockedConfig.Object);
        }
        [Fact]
        public void ShouldDeleteRoomsThatHaveNotBeenEditForLongTime()
        {
            var oldRoom = _sut.CreateRoom();
            var oldRoomId = oldRoom.RoomId;
            _currentDate = _currentDate + TimeSpan.FromMinutes(71);

            var deletedRooms = _sut.DeleteExpired(TimeSpan.FromMinutes(60));

            deletedRooms.Should().Be(1);
            Assert.Throws<Exception>(() => _sut.GetRoom(oldRoomId));
        }

        [Fact]
        public void ShouldNotDeleteRoomsThatHaveBeenEditRecently()
        {
            var newRoom = _sut.CreateRoom();
            var newRoomId = newRoom.RoomId;

            _currentDate = _currentDate + TimeSpan.FromMinutes(30);
            newRoom.ExecuteActionAsync(null);

            _sut.DeleteExpired(TimeSpan.FromMinutes(60));

            _sut.GetRoom(newRoomId).Should().NotBeNull();
        }
    }
}
