namespace Backend.Models
{
    public class Room : IIdentifiable
    {
        public string Id { get; set; }

        public string CreationTime { get; set; }
        public string OwnerId { get; set; }
    }
}
