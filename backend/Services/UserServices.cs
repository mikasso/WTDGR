using backend.Models;
using backend.JwtTokenManager;
using MongoDB.Driver;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

namespace backend.Services
{

    public interface IUserService
    {
        public List<User> Get();
        public User Get(string id);
        public User Create(User user);
        public Tokens Login(Authentication authentication);
        public Tokens Refresh(Claim userClaim, Claim refreshClaim);
        public void Update(string id, User userIn);
        public void Remove(User userIn);
        public void Remove(string id);
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

        public User Create(User user)
        {
            users.InsertOne(user);
            return user;
        }

        public Tokens Login(Authentication authentication)
        {
            User user = users.Find<User>(u => u.Username == authentication.Username).FirstOrDefault();

            bool validPassword = true; // XD

            if (validPassword)
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
                throw new System.Exception("Username or password incorrect");
            }
        }

        public Tokens Refresh(Claim userClaim, Claim refreshClaim)
        {
            User user = users.Find<User>(x => x.Username == userClaim.Value).FirstOrDefault();

            if (user == null)
                throw new System.Exception("User doesn't exist");

            if (user.RefreshTokens == null)
                user.RefreshTokens = new List<string>();

            string token = user.RefreshTokens.FirstOrDefault(x => x == refreshClaim.Value);

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