using System.Security.Cryptography;
using System;
using System.Collections.Generic;
using JWT.Builder;
using JWT.Algorithms;
using System.Text;
using backend.Models;
using Microsoft.Extensions.Options;

namespace backend.JwtTokenManager
{
    public interface ITokenManager
    {
        public string GenerateAccessToken(User user);
        public (string refreshToken, string jwt) GenerateRefreshToken(User user);

        public IDictionary<string, object> VerifyToken(string token);
    }
    public class TokenManager : ITokenManager
    {
        public TokenManager(IOptions<JwtSettings> settings)
        {
            Secret = settings.Value.Key;
        }

        private readonly string Secret;
        public string GenerateAccessToken(User user)
        {
            return new JwtBuilder()
                .WithAlgorithm(new HMACSHA256Algorithm())
                .WithSecret(Encoding.ASCII.GetBytes(Secret))
                .AddClaim("exp", DateTimeOffset.UtcNow.AddMinutes(10).ToUnixTimeSeconds())
                .AddClaim("username", user.Username)
                .Issuer("JwtExample")
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

            string jwt = new JwtBuilder()
                .WithAlgorithm(new HMACSHA256Algorithm())
                .WithSecret(Secret)
                .AddClaim("exp", DateTimeOffset.UtcNow.AddHours(4).ToUnixTimeSeconds())
                .AddClaim("refresh", randomString)
                .AddClaim("username", user.Username)
                .Issuer("JwtExample")
                .Audience("refresh")
                .Encode();

            return (randomString, jwt);
        }

        public IDictionary<string, object> VerifyToken(string token)
        {
            return new JwtBuilder()
                 .WithSecret(Secret)
                 .MustVerifySignature()
                 .Decode<IDictionary<string, object>>(token);
        }
    }
}