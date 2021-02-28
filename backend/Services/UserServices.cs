using backend.Models;
using backend.JwtTokenManager;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System;

namespace backend.Services
{

    public interface IUserService
    {
        public List<User> Get();
        public User Get(string id);
        public User CreateUser(User user);
        public User CreateOwner(User owner, string roomId);
        public Tokens Authenticate(User user);
        public Tokens Refresh(string username, string refreshKey);
        public void Update(string id, User userIn);
        public void Remove(User userIn);
        public void Remove(string id);
        public bool UserExistsInRoom(string username, string roomId);
    }
    public class UserService : IUserService
    {
        private readonly IMongoCollection<User> users;
        private readonly ITokenManager tokenManager;
        public UserService(IDatabaseSettings settings, ITokenManager tokenManager)
        {
            var client = new MongoClient(settings.ConnectionString);
            var database = client.GetDatabase(settings.DatabaseName);

            this.tokenManager = tokenManager;

            users = database.GetCollection<User>("users");
        }

        public List<User> Get() =>
            users.Find(user => true).ToList();

        public User Get(string id) =>
            users.Find<User>(user => user.Id == id).FirstOrDefault();

        public bool UserExistsInRoom(string userId, string roomId)
        {
            var found = users.Find<User>
                (u => u.RoomId == roomId && u.Id == userId)
                .FirstOrDefault();
            return found != null;
        }

        private bool UserWithThisNameExistsInRoom(User user)
        {
            var found = users.Find<User>
            (u => u.RoomId == user.RoomId && u.Username == user.Username)
            .FirstOrDefault();
            return found != null;
        }


        public User CreateUser(User user)
        {
            if (UserWithThisNameExistsInRoom(user))
                throw new System.Exception("User already exists in this room");

            user.Role = UserRoles.User;
            users.InsertOne(user);
            return user;
        }

        public User CreateOwner(User owner, string roomId)
        {
            owner.Role = UserRoles.Owner;
            owner.RoomId = roomId;
            users.InsertOne(owner);
            return owner;
        }

        public Tokens Authenticate(User user)
        {
            var foundUser = users.Find<User>(
                                  u => u.Username == user.Username &&
                                  u.RoomId == user.RoomId &&
                                  u.Role == user.Role).FirstOrDefault();

            bool userExists = foundUser != null;

            if (userExists)
            {
                var refreshToken = tokenManager.GenerateRefreshToken(user);

                if (user.RefreshTokens == null)
                    user.RefreshTokens = new List<string>();

                user.RefreshTokens.Add(refreshToken.refreshToken);

                users.ReplaceOne(u => u.Id == user.Id, user);

                return new Tokens
                {
                    AccessToken = tokenManager.GenerateAccessToken(user),
                    RefreshToken = refreshToken.jwt
                };
            }
            else
            {
                throw new System.Exception("Username data are incorrect. User doesnt exist in database!");
            }
        }

        public Tokens Refresh(string username, string refreshKey)
        {
            User user = users.Find<User>(x => x.Username == username).FirstOrDefault();

            if (user == null)
                throw new System.Exception("User doesn't exist");

            if (user.RefreshTokens == null)
                user.RefreshTokens = new List<string>();

            string token = user.RefreshTokens.FirstOrDefault(x => x == refreshKey);

            if (token != null)
            {
                var refreshToken = tokenManager.GenerateRefreshToken(user);

                user.RefreshTokens.Add(refreshToken.refreshToken);

                user.RefreshTokens.Remove(token);

                users.ReplaceOne(u => u.Id == user.Id, user);

                return new Tokens
                {
                    AccessToken = tokenManager.GenerateAccessToken(user),
                    RefreshToken = refreshToken.jwt
                };
            }
            else
            {
                throw new System.Exception("Refresh token incorrect");
            }
        }

        public void Update(string id, User userIn) =>
            users.ReplaceOne(user => user.Id == id, userIn);

        public void Remove(User userIn) =>
            users.DeleteOne(user => user.Id == userIn.Id);

        public void Remove(string id) =>
            users.DeleteOne(user => user.Id == id);
    }
}