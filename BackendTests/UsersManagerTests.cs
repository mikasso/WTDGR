using Backend.Helpers;
using Backend.Models;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace BackendTests
{
    public class UsersManagerTests
    {

        [Fact]
        public void UserExists_AfterAddShouldReturnTrue()
        {
            //Arrange
            var Users = new UsersManager();
            //Act
            Users.Add(NewUser);
            //Assert
            Assert.True(Users.Exists(NewUser));
        }

        [Fact]
        public void UserExists_AfterAddOtherShouldReturnFalse()
        {
            //Arange
            var Users = new UsersManager();
            var Added = NewUser;
            Added.Name = "XXX";
            Users.Add(Added);
            //Act
            var exists = Users.Exists(NewUser);
            //Assert
            Assert.False(exists);
        }

        [Fact]
        public void UserExists_ShouldReturnFalse()
        {
            //Arange
            var Users = new UsersManager();
            //Act
            var exists = Users.Exists(NewUser);
            //Assert
            Assert.False(exists);
        }

        [Fact]
        public void UserUpdate_ShouldReturnTrue()
        {
            //Arange
            var Users = new UsersManager();
            var Added = NewUser;
            Users.Add(Added);
            Added.Role = "Owner";
            //Act
            Users.Update(Added);
            var newRole = Users.Get(Added.Name).Role;
            //Assert
            Assert.True(newRole == Added.Role);
        }


        [Fact]
        public void Get_ShouldReturnGivenUser()
        {
            //Arange
            var Users = new UsersManager();
            var Given = NewUser;
            Users.Add(Given);
            //Act
            var Founded = Users.Get(Given.Name);
            //Assert
            Assert.Equal(Founded.Name, Given.Name);
            Assert.Equal(Founded.Role, Given.Role);
        }

        [Fact]
        public void Delete_ShouldNotFindUserAfterDelete()
        {
            //Arrange
            var Users = new UsersManager();
            Users.Add(NewUser);
            //Act
            Users.Delete(NewUser.Name);
            //Assert
            Assert.False(Users.Exists(NewUser));
        }

        [Fact]
        public void GetAll_ShouldReturnAllUsers()
        {
            //Arrange
            var Users = new UsersManager();
            List<User> myUsers = new()
            {
                NewUser,
                NewUser,
                NewUser
            };
            int id = 1;
            foreach (var user in myUsers)
            {
                user.Name = id.ToString();
                id++;
                Users.Add(user);
            }
            //Act
            var FoundedUsers = Users.GetAll();
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
                Assert.Equal(item.Founded.Name, item.ShouldFound.Name);
            }
        }


        private static User NewUser
        {
            get
            {
                {
                    return new User
                    {
                        Role = "User",
                        Name = "User_1",
                        RoomId = "130139"
                    };
                }
            }
        }
    }
}
