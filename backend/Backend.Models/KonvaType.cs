using Newtonsoft.Json.Converters;
using System.Runtime.Serialization;


namespace Backend.Models
{
    [Newtonsoft.Json.JsonConverter(typeof(StringEnumConverter))]
    public enum KonvaType
    {
        [EnumMember(Value = "Vertex")]
        Vertex,
        [EnumMember(Value = "Edge")]
        Edge,
        [EnumMember(Value = "Layer")]
        Layer,
        [EnumMember(Value = "TemporaryLine")]
        Line,
        [EnumMember(Value = "PencilLine")]
        PencilLine,
    }
}
