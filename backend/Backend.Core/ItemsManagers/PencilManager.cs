using Backend.Models;
using Backend.Models.RoomItems;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Backend.Core
{
    public class PencilManager : IRoomItemsManager
    {
        private readonly Dictionary<string, PencilLine> _pencilLines = new Dictionary<string, PencilLine>();
        public int Count => _pencilLines.Count;
        private List<PencilLine> LinesList { get => _pencilLines.Values.ToList(); }

        public bool Add(IRoomItem pencilLine, string userId) => _pencilLines.TryAdd(pencilLine.Id, (PencilLine)pencilLine);

        public bool Delete(string Id) {
            return _pencilLines.Remove(Id);
        }

        public bool Exists(string Id) => _pencilLines.ContainsKey(Id);

        public IRoomItem Get(string Id) => _pencilLines.GetValueOrDefault(Id);

        public IList<IRoomItem> GetAll() => LinesList.Cast<IRoomItem>().ToList();

        public bool Update(IRoomItem pencilLine)
        {
            if (Exists(pencilLine.Id))
            {
                _pencilLines[pencilLine.Id] = (PencilLine)pencilLine;
                return true;
            }
            return false;
        }

    }
}
