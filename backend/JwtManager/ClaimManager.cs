using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Backend.JwtManager
{
    public static class ClaimType
    {
        public const string UserId = "userId";
        public const string RoomId = "roomId";
        public const string Username = "username";
        public const string Role = "role";
        public const string Expire = "exp";
        public const string Refresh = "refresh";
    }
    public static class ClaimManager
    {
        public static string GetUserId(this ClaimsPrincipal User)
        {
            Claim claim = User.Claims.FirstOrDefault(x => x.Type == ClaimType.UserId);
            return claim.Value;
        }

        public static string GetRoomId(this ClaimsPrincipal User)
        {
            Claim claim = User.Claims.FirstOrDefault(x => x.Type == ClaimType.RoomId);
            return claim.Value;
        }
        public static string GetUsername(this ClaimsPrincipal User)
        {
            Claim claim = User.Claims.FirstOrDefault(x => x.Type == ClaimType.Username);
            return claim.Value;
        }
        public static string GetRole(this ClaimsPrincipal User)
        {
            Claim claim = User.Claims.FirstOrDefault(x => x.Type == ClaimType.Role);
            return claim.Value;
        }

        public static string GetExpire(this ClaimsPrincipal User)
        {
            Claim claim = User.Claims.FirstOrDefault(x => x.Type == ClaimType.Expire);
            return claim.Value;
        }

        public static string GetRefreshKey(this ClaimsPrincipal User)
        {
            Claim claim = User.Claims.FirstOrDefault(x => x.Type == ClaimType.Refresh);
            return claim.Value;
        }
    }

}
