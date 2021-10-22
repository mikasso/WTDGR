using Backend.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Backend.Core
{
    public interface IRoomItemsManager 
    {
        public int Count { get; }
        public bool Add(IRoomItem obj, string userId);

        public bool Delete(string Id);

        public bool Update(IRoomItem obj);

        public IList<IRoomItem> GetAll();

        public IRoomItem Get(string Id);

        public bool Exists(string Id);
    }
}
