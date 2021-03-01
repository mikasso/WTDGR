using Backend.JwtManager;
using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface ITokenService{
        public Tokens Authenticate(User user);
        public Tokens Refresh(string username, string refreshKey);
    }
    public class TokenService : ITokenService
    {
        private readonly ITokenManager tokenManager;
        private readonly IUserService userService;
        public TokenService(ITokenManager tokenManager, IUserService userService)
        {
            this.userService = userService;
            this.tokenManager = tokenManager;
        }

        public Tokens Authenticate(User user)
        {
            var foundUser = userService.GetByNameAndRoom(user.Username, user.RoomId);
            
            bool userExists = foundUser != null;

            if (userExists)
            {
                var refreshToken = tokenManager.GenerateRefreshToken(user);

                if (user.RefreshTokens == null)
                    user.RefreshTokens = new List<string>();

                user.RefreshTokens.Add(refreshToken.refreshToken);

                userService.Update(user.Id, user);

                return new Tokens
                {
                    AccessToken = tokenManager.GenerateAccessToken(user),
                    RefreshToken = refreshToken.jwt
                };
            }
            else
            {
                throw new Exception("Username data are incorrect. User doesnt exist in database!");
            }
        }

        public Tokens Refresh(string userId, string refreshKey)
        {
            User user = userService.GetById(userId);

            if (user == null)
                throw new Exception("User doesn't exist");

            if (user.RefreshTokens == null)
                user.RefreshTokens = new List<string>();

            string token = user.RefreshTokens.FirstOrDefault(x => x == refreshKey);

            if (token != null)
            {
                var refreshToken = tokenManager.GenerateRefreshToken(user);

                user.RefreshTokens.Add(refreshToken.refreshToken);

                user.RefreshTokens.Remove(token);

                userService.Update(user.Id, user);

                return new Tokens
                {
                    AccessToken = tokenManager.GenerateAccessToken(user),
                    RefreshToken = refreshToken.jwt
                };
            }
            else
            {
                throw new Exception("Refresh token incorrect");
            }
        }

    }
}
