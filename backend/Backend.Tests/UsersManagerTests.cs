using Backend.Core;
using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace BackendTests
{
    public class UsersManagerTests
    {

        private static User NewUser
        {
            get
            {
                {
                    return new User
                    {
                        Role = UserRole.Editor,
                        Id = "User_1",
                        RoomId = "130139"
                    };
                }
            }
        }

        private IRoomUsersManager _sut;
            public UsersManagerTests()
        {
            //Arrange
            _sut = new RoomUsersManager("1");
            _sut.CreateOwner("someone");
        }
        [Fact]
        public void UserExists_AfterAddShouldReturnTrue()
        {
            //Act
            _sut.Add(NewUser);
            //Assert
            Assert.True(_sut.Exists(NewUser));
        }

        [Fact]
        public void UserExists_AfterAddOtherShouldReturnFalse()
        {
            var Added = NewUser;
            Added.Id = "XXX";
            _sut.Add(Added);
            //Act
            var exists = _sut.Exists(NewUser);
            //Assert
            Assert.False(exists);
        }

        [Fact]
        public void UserExists_ShouldReturnFalse()
        {
            //Act
            var exists = _sut.Exists(NewUser);
            //Assert
            Assert.False(exists);
        }

        [Fact]
        public void Get_ShouldReturnGivenUser()
        {
            var Given = NewUser;
            _sut.Add(Given);
            //Act
            var Founded = _sut.Get(Given.Id);
            //Assert
            Assert.Equal(Founded.Id, Given.Id);
            Assert.Equal(Founded.Role, Given.Role);
        }

        [Fact]
        public void Delete_ShouldNotFindUserAfterDelete()
        {
            _sut.Add(NewUser);
            //Act
            _sut.Delete(NewUser.Id);
            //Assert
            Assert.False(_sut.Exists(NewUser));
        }

        [Fact]
        public void GetAll_ShouldReturnAllUsers()
        {
            List<User> myUsers = new()
            {
                NewUser,
                NewUser,
                NewUser
            };
            int id = 1;
            foreach (var user in myUsers)
            {
                user.Id = id.ToString();
                id++;
                _sut.Add(user);
            }
            //Act
            var FoundedUsers = _sut.GetAll();
            //Assert
            var allUsers = FoundedUsers.Zip(myUsers, (first, second) =>
               {
                   return new
                   {
                       Founded = first,
                       ShouldFound = second
                   };
               });
            foreach(var item in allUsers)
            {
                Assert.Equal(item.Founded.Id, item.ShouldFound.Id);
            }
        }

        [Fact]
        public void  CreatingOwnerSecondTime_Should_ThrowsErrorWhenCalledTwice()
        {
            Assert.Throws<Exception>(() => _sut.CreateOwner("1"));
        }
    }
}
