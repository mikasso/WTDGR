using Microsoft.Extensions.Options;
using Moq;
using Xunit;
using Backend;
using Backend.Services;
using Backend.JwtManager;
using MongoDB.Bson;
using Backend.Models;
using System.Collections.Generic;
using System.Linq;
using System;

namespace BackendTests
{

    public class UserServiceTests : IClassFixture<MongoDaemon>
    {
        private readonly MongoDaemon daemon;
        private readonly IUserService userService;

        private void ClearDatabase()
        {
            this.daemon.Query("db.users.drop()");
        }
        public UserServiceTests(MongoDaemon daemon)
        {
            this.daemon = daemon;
            ClearDatabase();

            var dbSettings = new DatabaseSettings()
            {
                ConnectionString = "mongodb://localhost:27017",
                DatabaseName = MongoDaemon.DbName
            };
            var optJwt = new JwtSettings()
            {
                Issuer = "JwtTest",
                AccessTokenLifetime = 10,
                RefreshTokenLifetime = 10,
                Audience = "access",
                Key = "123456780"
            };
            var optsMock = new Mock<IOptions<JwtSettings>>();
            optsMock.Setup(x => x.Value).Returns(optJwt);
            TokenManager tokenManager = new TokenManager(optsMock.Object);
            this.userService = new UserService(dbSettings);
        }

        [Fact]
        public void GetUserByID_ShoulBeFoundAfterInsert()
        {
            // arrange : insert test data
            ClearDatabase();
            var user = new User()
            {
                RoomId = "123456708",
                Username = "Jacek"
            };
            user = userService.CreateUser(user);

            // act
            var result = userService.GetById(user.Id);

            // assert
            Assert.Equal(user.Username, result.Username);
            Assert.Equal(user.Id, result.Id);
            Assert.Equal(user.RoomId, result.RoomId);
        }

        [Fact]
        public void UsersExistsInRoom_ShoulBeTrueAfterInsert()
        {
            // arrange 
            ClearDatabase();
            string roomId = "130747924238";
            var user = new User()
            {
                RoomId = roomId,
                Username = "Kacper"
            };
            user = userService.CreateUser(user);
            // act
            var result = userService.UserExistsInRoom(user.Id, roomId);
            // assert
            Assert.True(result);
        }

        [Fact]
        public void UsersExistsInRoom_ShoulBeFalseWhenNoUser()
        {
            // arrange 
            ClearDatabase();
            string roomId = "130747924238";
            // act
            var result = userService.UserExistsInRoom(new ObjectId().ToString(), roomId);
            // assert
            Assert.False(result);
        }

        [Fact]
        public void UsersExistsInRoom_ShoulBeFalseWhenUserIsInDiffrentRoom()
        {
            // arrange 
            ClearDatabase();
            string roomId = "130747924238";
            var user = new User()
            {
                RoomId = "1",
                Username = "Kacper"
            };
            user = userService.CreateUser(user);
            // act
            var result = userService.UserExistsInRoom(user.Id, roomId);
            // assert
            Assert.False(result);
        }

        [Fact]
        public void CreateUser_ShouldThrowExceptionWithTheSameNameInSameRoom()
        {
            // arrange 
            ClearDatabase();
            var user = new User()
            {
                RoomId = "123456708",
                Username = "Jacek"
            };
            userService.CreateUser(user);
            // assert
            Assert.Throws<Exception>(() => userService.CreateUser(user));
        }

        [Fact]
        public void GetByNameAndRoom_ShouldFoundUser()
        {
            // arrange 
            ClearDatabase();
            var user = new User()
            {
                RoomId = "123456708",
                Username = "Jacek"
            };
            user = userService.CreateUser(user);

            // act
            var result = userService.GetByNameAndRoom(user.Username, user.RoomId);

            // assert
            Assert.NotNull(result);
            Assert.Equal(user.Username, result.Username);
            Assert.Equal(user.Id, result.Id);
            Assert.Equal(user.RoomId, result.RoomId);
        }

        [Fact]
        public void GetByAllInRoom_ShouldReturnAllUsers()
        {
            // arrange
            ClearDatabase();
            var roomId = "123456708";
            var user1 = new User()
            {
                RoomId = roomId,
                Username = "Jacek"
            };
            var user2 = new User()
            {
                RoomId = roomId,
                Username = "Krzysztof"
            };
            var user3 = new User()
            {
                RoomId = roomId,
                Username = "Pawel"
            };
            List<User> usersToAdd = new List<User>() { user1, user2, user3 };
            List<User> usersCreated = new List<User>();
            foreach (var user in usersToAdd)
            {
                var newUser = userService.CreateUser(user);
                usersCreated.Add(newUser);
            }
            // act
            var result = userService.GetAllInRoom(roomId);


            var CreatedAndResults = usersCreated.Zip(result, (first, second) => new
            {
                Created = first,
                Found = second
            });
            // assert
            foreach (var item in CreatedAndResults)
            {
                User created = item.Created;
                User found = item.Found;

                Assert.Equal(created.Username, found.Username);
                Assert.Equal(created.Id, found.Id);
                Assert.Equal(created.RoomId, found.RoomId);
            }
        }

    }

}
