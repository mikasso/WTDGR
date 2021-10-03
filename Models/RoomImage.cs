using Backend.Models.RoomItems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class RoomImage
    {
        public List<Vertex> Vertices { get; set; }
        public List<Edge> Edges { get; set; }
        public List<Layer> Layers { get; set; }
    }
}
