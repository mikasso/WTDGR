using Backend.Models;
using Backend.Models.RoomItems;
using System.Collections.Generic;
using System.Linq;
using Serilog;
using System;

namespace Backend.Core
{
    internal class LayersManager : IRoomItemsManager
    {
        private List<Layer> _layers = new List<Layer>();
        public int Count => _layers.Count;
        private int _layerNameCount ;
        private IRoomItemsManager _vertexManager;
        private const int _maxCount = 4;
        public void Initialize(IRoomItemsManager verticesManager)
        {
            _vertexManager = verticesManager;
            _layerNameCount = 1;
            Add(new Layer() { Id = "Layer 1", Type = KonvaType.Layer },"");
        }
        public bool Add(IRoomItem item,string userId)
        {
            if (Count >= _maxCount)
                return false;
            var layer = (Layer)item;
            layer.Id = $"Layer {_layerNameCount}";
            _layerNameCount++;
            _layers.Add(layer);
            return true;
        }

        public bool Delete(string Id)
        {
            bool result = _layers.Remove((Layer)Get(Id));
            if (!result)
            {
                string layersStr = "";
                for (int i = 0; i < _layers.Count; i++) layersStr += $"\"{_layers[i].Id}\", ";
                Log.Warning($"Failed to delete layer: \"{Id}\" from layers: {layersStr}");
                return false;
            }

            var vertexDeleteResult = _vertexManager.GetAll().Cast<Vertex>()
                .Where(v => v.Layer == Id)
                .All(toDelete => _vertexManager.Delete(toDelete.Id));   //Removing vertex causes remove all of edges
            return result && vertexDeleteResult;
        }

        public bool Exists(string Id) => GetIndex(Id) != -1;

        public IRoomItem Get(string Id) => _layers.Find((Layer layer) => layer.Id == Id);


        public int GetIndex(string Id)
        {
            for (int i = 0; i < _layers.Count; i++)
            {
                if (_layers[i].Id == Id) return i;
            }
            return -1;
        }

        public IList<IRoomItem> GetAll() => _layers.Cast<IRoomItem>().ToList();

        public bool Update(IRoomItem obj)
        {
            if (Exists(obj.Id))
            {
                Layer layer = (Layer)obj;
                if (layer.ReplaceWithId != null)
                {
                    int replaceWithIndex = GetIndex(layer.ReplaceWithId);
                    _layers[GetIndex(layer.Id)] = (Layer)Get(layer.ReplaceWithId);
                    _layers[replaceWithIndex] = layer;
                    return true;
                }
                _layers[GetIndex(obj.Id)] = layer;
                return true;
            }
            return false;
        }
    }
}