using System.Security.Cryptography;
using System;
using System.Collections.Generic;
using JWT.Builder;
using JWT.Algorithms;
using System.Text;
using Backend.Models;
using Microsoft.Extensions.Options;
using Backend.JwtManager;

namespace Backend.JwtManager
{
    public interface ITokenManager
    {
        public string GenerateAccessToken(User user);
        public (string refreshToken, string jwt) GenerateRefreshToken(User user);

        public IDictionary<string, object> VerifyToken(string token);
    }
    public class TokenManager : ITokenManager
    {
        JwtSettings Settings { get; set; }
        public TokenManager(IOptions<JwtSettings> settings)
        {
            this.Settings = settings.Value;
        }

        private JwtBuilder GenerateTokenBase(User user, int lifeTimeInMinutes)
        {
            return new JwtBuilder()
                .WithAlgorithm(new HMACSHA256Algorithm())
                .WithSecret(Settings.Key)
                .AddClaim(ClaimType.Username, user.Username)
                .AddClaim(ClaimType.Role, user.Role)
                .AddClaim(ClaimType.RoomId, user.RoomId)
                .AddClaim(ClaimType.UserId, user.Id)
                .AddClaim(ClaimType.Expire, DateTimeOffset.UtcNow.AddMinutes(lifeTimeInMinutes).ToUnixTimeSeconds())
                .Issuer(Settings.Issuer);
        }

        public string GenerateAccessToken(User user)
        {
            return GenerateTokenBase(user, Settings.AccessTokenLifetime)
                .Audience("access")
                .Encode();
        }

        public (string refreshToken, string jwt) GenerateRefreshToken(User user)
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                Convert.ToBase64String(randomNumber);
            }

            var randomString = System.Text.Encoding.ASCII.GetString(randomNumber);

            string jwt = GenerateTokenBase(user, Settings.RefreshTokenLifetime)
                .AddClaim(ClaimType.Refresh, randomString)
                .Audience("refresh")
                .Encode();

            return (randomString, jwt);
        }

        public IDictionary<string, object> VerifyToken(string token)
        {
            return new JwtBuilder()
                 .WithSecret(Settings.Key)
                 .MustVerifySignature()
                 .Decode<IDictionary<string, object>>(token);
        }
    }
}