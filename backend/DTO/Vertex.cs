using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.DTO
{
    public class Vertex
    {
        public string Type { get; set; }
        public string Name { get; set; }
        public Config Config { get; set; }
    }

    public class Config
    {
        public int Y { get; set; }
        public int X { get; set; }
        public int Radius { get; set; }
        public string Fill { get; set; }
        public string Stroke { get; set; }
        public int StrokeWidth { get; set; }

    }
}
