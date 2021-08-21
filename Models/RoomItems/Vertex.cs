﻿namespace Backend.Models.RoomItems
{
    public class Vertex : IRoomItem
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public float Y { get; set; }
        public float X { get; set; }
        public int Radius { get; set; }
        public string Fill { get; set; }
        public string Stroke { get; set; }
        public int StrokeWidth { get; set; }
    }

}