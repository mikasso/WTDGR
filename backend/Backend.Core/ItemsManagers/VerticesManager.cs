using Backend.Models;
using Backend.Models.RoomItems;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Backend.Core
{
    public class VerticesManager : IRoomItemsManager
    {
        private readonly Dictionary<string, Vertex> _vertices = new Dictionary<string, Vertex>();
        private EdgeManager _edgeManager;
        internal void Initialize(EdgeManager edgeManager)
        {
            _edgeManager = edgeManager;
        }
        public int Count => _vertices.Count;
        private List<Vertex> EdgesList { get => _vertices.Values.ToList(); }

        public bool Add(IRoomItem vertex) => _vertices.TryAdd(vertex.Id, (Vertex)vertex);

        public bool Delete(string Id) {
            _edgeManager.DeleteWithVertex(Id);
            return _vertices.Remove(Id);
        }

        public bool Exists(string Id) => _vertices.ContainsKey(Id);

        public IRoomItem Get(string Id) => _vertices.GetValueOrDefault(Id);

        public IList<IRoomItem> GetAll() => EdgesList.Cast<IRoomItem>().ToList();

        public bool Update(IRoomItem vertex)
        {
            if (Exists(vertex.Id))
            {
                _vertices[vertex.Id] = (Vertex)vertex;
                return true;
            }
            return false;
        }

    }
}
