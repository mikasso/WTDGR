using Newtonsoft.Json.Converters;

namespace Backend.Models
{
    [Newtonsoft.Json.JsonConverter(typeof(StringEnumConverter))]
    public enum ActionType
    {
        Add,
        Edit,
        RequestToEdit,
        ReleaseItem,
        Delete,
    }
}
