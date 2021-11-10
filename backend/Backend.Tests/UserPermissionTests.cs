using Backend.Core;
using Backend.Models;
using Backend.Models.RoomItems;
using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Backend.Tests
{
    public class UserPermissionTests 

    {
        private readonly UserAction addVertex;
        private readonly User _owner;
        private readonly User _user;


        private const string roomId = "RoomId";
        private IRoomUsersManager _sut;
        public UserPermissionTests()
        {
            _sut = new RoomUsersManager(roomId);
            _owner = _sut.CreateOwner("owner");
            _user = new User()
            {
                Id = "editor",
                Role = UserRole.Viewer,
                RoomId = roomId
            };
            _sut.Add(_user);
            _sut.Add(_owner);
        }



        [Fact]
        public void  User_ShouldNotBeAbleToEditAnything_WhenHeDidntGetPermission()
        {
            _sut.CanEdit(_user.Id).Should().Be(false);
        }

        [Fact]
        public void User_ShouldBeAbleToEditAnything_WhenHeGotPermissionFromOwner()
        {
            _sut.SetEditor(_owner.Id, _user.Id);
            _sut.CanEdit(_user.Id).Should().Be(true);
        }

        [Fact]
        public void UserDiffrentThanOwner_ShouldNotChangeAnyRole()
        {
            _sut.SetEditor(_user.Id, _user.Id).Should().Be(false);
            _sut.SetViewer(_user.Id, _user.Id).Should().Be(false);
        }

        [Fact]
        public void Owner_ShouldNot_TakeAwayHisPermission()
        {
            _sut.SetEditor(_owner.Id, _owner.Id).Should().Be(false);
            _sut.SetViewer(_owner.Id, _owner.Id).Should().Be(false);
        }

        [Fact]
        public void Owner_ShouldBeOwnerAfter_Rejoin()
        {
            _sut.Delete(_owner.Id);
            var owner = new User()
            {
                Id =  _owner.Id,
                Role = UserRole.Viewer,
                RoomId = roomId
            };
            _sut.Add(owner);
            var role = _sut.Get(owner.Id).Role;
            role.Should().Be(UserRole.Owner);
        }
    }
}
