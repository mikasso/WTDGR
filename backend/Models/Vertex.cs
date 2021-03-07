using Backend.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.DTO
{
    public class Vertex : IName
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public int Y { get; set; }
        public int X { get; set; }
        public int Radius { get; set; }
        public string Fill { get; set; }
        public string Stroke { get; set; }
        public int StrokeWidth { get; set; }
    }

}
