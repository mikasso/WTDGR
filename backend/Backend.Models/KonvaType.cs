using Newtonsoft.Json.Converters;
using System.Runtime.Serialization;


namespace Backend.Models
{
    [Newtonsoft.Json.JsonConverter(typeof(StringEnumConverter))]
    public enum KonvaType
    {
        [EnumMember(Value = "v-circle")]
        Vertex,
        [EnumMember(Value = "edge")]
        Edge,
        [EnumMember(Value = "layer")]
        Layer,
        [EnumMember(Value = "line")]
        Line,
        [EnumMember(Value = "unknown?")]
        PencilLine,
    }
}
