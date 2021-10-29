using Backend.Models;
using Backend.Models.RoomItems;
using FluentAssertions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;
namespace Backend.Tests
{
    public class UserActionConverterTests
    {

        [Fact]
        public void TestDeserializing()
        {
            string actionJson =
                @"{
                ""ActionType"": ""Add"",
                  ""Items"": [{
                    ""Id"": ""1"",
                    ""Type"": ""Vertex"",
                    ""Layer"": ""1"",
                  }],
                  ""UserId"": ""1""
                }";
            var userAction = JsonConvert.DeserializeObject<UserAction>(actionJson, new Newtonsoft.Json.JsonSerializerSettings
            {
                TypeNameHandling = Newtonsoft.Json.TypeNameHandling.All,
                NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore,
            });
            userAction.Should().BeEquivalentTo(new UserAction{
                ActionType=ActionType.Add,
                Items = new List<IRoomItem>() { new Vertex() { Id = "1", Type = KonvaType.Vertex, Layer = "1" } },
                UserId="1"
            });
        }

        [Fact]
        public void TestSerializing()
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
