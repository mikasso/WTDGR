using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Models.RoomItems
{
    public class Layer : IRoomItem
    {
        public KonvaType Type { get; set; }
        public string? EditorId { get; set; }
        public string Id { get; set; }
        public string? ReplaceWithId { get; set; }
    }
}
