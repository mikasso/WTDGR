namespace Backend.Models
{
    public interface IRoomItem : IIdentifiable
    {
        public KonvaType Type { get; set; }

        public string? EditorId { get; set; }
    }
}
