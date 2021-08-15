using Backend.Models;
using System;
using System.Collections.Generic;
namespace Backend.Helpers
{
    public abstract class RoomItemsManager<T> where T : IName
    {
        public int Count { get => objects.Count; }
        protected Dictionary<String, T> objects = new();
        public bool Add(T obj)
        {
            if (objects.ContainsKey(obj.Name))
                return false;
            objects.Add(obj.Name, obj);
            return true;
        }

        public bool Delete(string name)
        {
            if (!objects.ContainsKey(name))
                return false;
            objects.Remove(name);
            return true;
        }

        public bool Update(T obj)
        {
            if (!objects.ContainsKey(obj.Name))
                return false;
            objects[obj.Name] = obj;
            return true;
        }

        public IEnumerable<T> GetAll()
        {
            return objects.Values;
        }

        public T Get(string Id)
        {
            if (!objects.ContainsKey(Id))
                throw new Exception($"{Id} does not exist in collection");
            return objects[Id];
        }
    }
}
