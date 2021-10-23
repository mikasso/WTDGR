using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Models.RoomItems
{
    public class Line : IRoomItem
    {
        public KonvaType Type { get; set; }
        public string EditorId { get; set; }
        public string Id { get; set; }
        public string Layer { get; set; }
        public string LineCap { get; set; }
        public string LineJoin { get; set; }
        public string Stroke { get; set; }
        public string V1 { get; set; }
        public int[] Points { get; set; }
    }
}
