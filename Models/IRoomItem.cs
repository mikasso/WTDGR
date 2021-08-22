namespace Backend.Models
{
    public interface IRoomItem : IIdentifiable
    {
        public string Type { get; set; }
    }
}
