using Backend.Models;
using Backend.Models.RoomItems;
using FluentAssertions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;
namespace Backend.Tests
{
    public class UserActionConverterTests
    {

        [Fact]
        public void DeserializingItemShouldWork()
        {
            string itemJson =
                @"{
                    ""id"": ""1"",
                    ""type"": ""Vertex"",
                    ""layer"": ""1"",
                  }
                ";

            var converter = new RoomItemConverter();
            JsonReader reader = new JsonTextReader(new StringReader(itemJson));
            while (reader.TokenType == JsonToken.None)
                if (!reader.Read())
                    break;

            var obj = converter.ReadJson(reader, typeof(IRoomItem), null, JsonSerializer.CreateDefault());
            obj.Should().BeEquivalentTo(
                 new Vertex() { Id = "1", Type = KonvaType.Vertex, Layer = "1" } 
            );
        }

        [Fact]
        public void SerializingUserActionShouldWork()
        {
            var userAction = new UserAction
            {
                ActionType = ActionType.Add,
                Items = new List<IRoomItem>() { new Vertex() { Id = "1", Type = KonvaType.Vertex, Layer = "1" } },
                UserId = "1"
            };
            var userActionStr = JsonConvert.SerializeObject(userAction);
            JObject receivedObject = JObject.Parse(userActionStr);
            JObject expectedObject = JObject.Parse(
                @"{
                  ""ActionType"": ""Add"",
                  ""Items"": [{
                    ""Id"": ""1"",
                    ""Type"": ""Vertex"",
                    ""Y"": 0.0,
                    ""X"": 0.0,
                    ""Radius"": 0,
                    ""Fill"": null,
                    ""Stroke"": null,
                    ""Layer"": ""1"",
                    ""EditorId"": null
                  }],
                  ""UserId"": ""1""
                }");
            receivedObject.ToString().Should().Be(expectedObject.ToString());
        }
    }
}
