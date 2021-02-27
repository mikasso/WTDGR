namespace backend
{

    public interface IJwtSettings
    {
        public string Key { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }
    }
    public class JwtSettings : IJwtSettings
    {

        public string Key { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }

    }
}
