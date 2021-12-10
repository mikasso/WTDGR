using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Models.RoomItems
{
    public class PencilLine : IRoomItem
    {
        public KonvaType Type { get; set; }
        public string EditorId { get; set; }
        public string Id { get; set; }
        public string Layer { get; set; }
        public string LineCap { get; set; }
        public string LineJoin { get; set; }
        public string Stroke { get; set; }
        public int StrokeWidth { get; set; }
        public IList<int> Points { get; set; }
    }
}
