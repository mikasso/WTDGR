namespace Backend.Models
{
    public interface IRoomItem : IIdentifiable
    {
        public string Id { get; set; }
        public string Type { get; set; }
    }
}
