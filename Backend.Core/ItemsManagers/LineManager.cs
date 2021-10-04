using Backend.Models;
using Backend.Models.RoomItems;
using System.Collections.Generic;
using System.Linq;
namespace Backend.Core
{
    internal class LineManager : IRoomItemsManager
    {
        private readonly Dictionary<string, Line> _lines = new Dictionary<string, Line>();
        public int Count => _lines.Count;
        private List<Line> LinesList { get => _lines.Values.ToList(); }

        public bool Add(IRoomItem line) => _lines.TryAdd(line.Id, (Line) line);

        public bool Delete(string Id) => _lines.Remove(Id);

        public bool Exists(string Id) => _lines.ContainsKey(Id);

        public IRoomItem Get(string Id) => _lines.GetValueOrDefault(Id);

        public IList<IRoomItem> GetAll() =>LinesList.Cast<IRoomItem>().ToList();

        public bool Update(IRoomItem obj)
        {
            if (Exists(obj.Id))
            {
                _lines[obj.Id] = (Line)obj;
                return true;
            }
            return false;
        }
    }
}
