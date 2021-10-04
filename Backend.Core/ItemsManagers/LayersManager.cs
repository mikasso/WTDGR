using Backend.Models;
using Backend.Models.RoomItems;
using System.Collections.Generic;
using System.Linq;
namespace Backend.Core
{
    internal class LayersManager : IRoomItemsManager
    {
        private readonly Dictionary<string, Layer> _layers = new Dictionary<string, Layer>();
        public int Count => _layers.Count;
        private List<Layer> LayerList { get => _layers.Values.ToList(); }

        public bool Add(IRoomItem item) {
            var layer = (Layer)item;
            layer.Id = $"Layer {Count + 1}";
            return _layers.TryAdd(layer.Id, layer);
        }

        public bool Delete(string Id) => _layers.Remove(Id);

        public bool Exists(string Id) => _layers.ContainsKey(Id);

        public IRoomItem Get(string Id) => _layers.GetValueOrDefault(Id);

        public IList<IRoomItem> GetAll() => LayerList.Cast<IRoomItem>().ToList();

        public bool Update(IRoomItem obj)
        {
            if (Exists(obj.Id))
            {
                _layers[obj.Id] = (Layer) obj;
                return true;
            }
            return false;
        }
    }
}