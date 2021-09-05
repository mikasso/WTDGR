using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Backend.Core
{
    public abstract class RoomItemsManager<T> where T : IIdentifiable
    {
        public int Count { get => _objects.Count; }
        protected Dictionary<String, T> _objects = new();
        public bool Add(T obj)
        {
            if (_objects.ContainsKey(obj.Id))
                return false;
            _objects.Add(obj.Id, obj);
            return true;
        }

        public bool Delete(string name)
        {
            if (!_objects.ContainsKey(name))
                return false;
            _objects.Remove(name);
            return true;
        }

        public bool Update(T obj)
        {
            if (!_objects.ContainsKey(obj.Id))
                return false;
            _objects[obj.Id] = obj;
            return true;
        }

        public IList<T> GetAll()
        {
            return _objects.Values.ToList();
        }

        public T Get(string Id)
        {
            if (!_objects.ContainsKey(Id))
                return default(T);
            return _objects[Id];
        }
    }
}
