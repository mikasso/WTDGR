namespace Backend.Models
{
    public interface IRoomItem : IIdentifiable
    {
        public string Type { get; set; }

        public string Layer { get; set; }

        public string? EditorId { get; set; }
    }
}
