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
            return new Vertex();
        }

        public override void WriteJson(JsonWriter writer, IRoomItem value, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }
    }
}