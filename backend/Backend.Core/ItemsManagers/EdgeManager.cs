using Backend.Models;
using Backend.Models.RoomItems;
using System;
using System.Collections.Generic;
using System.Linq;
namespace Backend.Core
{
    public class EdgeManager : IRoomItemsManager
    {
        private VerticesManager _verticesManager;
        private readonly Dictionary<string, Edge> _edges = new Dictionary<string, Edge>();
        public void Initialize(VerticesManager verticesManager)
        {
            _verticesManager = verticesManager;
        }
        public int Count => _edges.Count;
        private List<Edge> EdgesList { get => _edges.Values.ToList(); }

        public bool Add(IRoomItem item)
        {
            var edge = (Edge)item;
            var v1 = (Vertex)_verticesManager.Get(edge.V1);
            var v2 = (Vertex)_verticesManager.Get(edge.V2);
            if (v1 != null && v2 != null && v1.Layer == v2.Layer &&
                    !EdgesList.Any(x => x.V1 == edge.V1 && x.V2 == edge.V2))
            {
                return _edges.TryAdd(edge.Id, edge);
            }
            return false;
        }

        internal bool DeleteWithVertex(string id) => EdgesList
                .Where(x => x.V1 == id || x.V2 == id)
                .All(x => Delete(x.Id));
        
        public bool Delete(string Id) => _edges.Remove(Id);

        public bool Exists(string Id) => _edges.ContainsKey(Id);

        public IRoomItem Get(string Id) => _edges.GetValueOrDefault(Id);

        public IList<IRoomItem> GetAll() => EdgesList.Cast<IRoomItem>().ToList();

        public bool Update(IRoomItem obj)
        {
            if (Exists(obj.Id))
            {
                _edges[obj.Id] = (Edge)obj;
                return true;
            }
            return false;
        }
    }
}
