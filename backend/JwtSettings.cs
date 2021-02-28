namespace backend
{

    public interface IJwtSettings : IJwtParametersOptions 
    {
        public int AccessTokenLifetime { get; set; }
        public int RefreshTokenLifetime { get; set; }
        public string Audience { get; set; }
    }

    public interface IJwtParametersOptions
    {
        public string Key { get; set; }
        public string Issuer { get; set; }
    }

    public class JwtSettings : IJwtSettings
    {

        public string Key { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }

        public int AccessTokenLifetime { get; set; }
        public int RefreshTokenLifetime { get; set; }

    }
}
