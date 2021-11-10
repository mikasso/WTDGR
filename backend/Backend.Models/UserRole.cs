using Newtonsoft.Json.Converters;

namespace Backend.Models
{
    [Newtonsoft.Json.JsonConverter(typeof(StringEnumConverter))]
    public enum UserRole
    {
        Owner,
        Viewer,
        Editor
    }
}
