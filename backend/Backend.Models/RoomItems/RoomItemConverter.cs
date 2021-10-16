using Backend.Models.RoomItems;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;

namespace Backend.Models
{
    public class RoomItemConverter : JsonConverter<IRoomItem>
    {
        public override bool CanRead => true;
        public override bool CanWrite
        {
            get { return false; }
        }
        public override IRoomItem ReadJson(JsonReader reader, Type objectType, IRoomItem existingValue, bool hasExistingValue, JsonSerializer serializer)
        {
            // Load JObject from stream
            JObject jObject = JObject.Load(reader);

            // Create target object based on JObject
            IRoomItem target = Create(objectType, jObject);

            // Populate the object properties
            serializer.Populate(jObject.CreateReader(), target);

            return target;
        }

        private IRoomItem Create(Type objectType, JObject jObject)
        {
            if (!jObject.ContainsKey("type")) throw new InvalidCastException("Cannot cast object which doesnt type property!");
            var value = jObject["type"].ToString();
            switch (value)
            {
                case "Vertex":
                    return new Vertex();
                    break;
                case "Layer":
                    return new Layer();
                    break;
                case "Edge":
                    return new Edge();
                case "TemporaryLine":
                    return new Line();
                default:
                    throw new InvalidCastException($"Cant cast when type value is {value}");
            }
        }

        public override void WriteJson(JsonWriter writer, IRoomItem value, JsonSerializer serializer)
        {
            JObject obj = new JObject();
            Type type = value.GetType();

            foreach (var prop in type.GetProperties())
            {
                if (prop.CanRead)
                {
                    object propVal = prop.GetValue(value, null);
                    if (propVal != null)
                    {
                        obj.Add(prop.Name, JToken.FromObject(propVal, serializer));
                    }
                }
            }
            obj.WriteTo(writer);
        }
    }
}