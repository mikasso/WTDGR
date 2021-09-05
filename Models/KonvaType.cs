using Newtonsoft.Json.Converters;
using System.Runtime.Serialization;


namespace Backend.Models
{
    [Newtonsoft.Json.JsonConverter(typeof(StringEnumConverter))]
    public enum KonvaType
    {
        [EnumMember(Value = "v-circle")]
        Vertex,
        [EnumMember(Value = "v-line")]
        Edge,
        [EnumMember(Value = "layer")]
        Layer,
        [EnumMember(Value = "unknown?")]
        PencilLine,
    }
}
