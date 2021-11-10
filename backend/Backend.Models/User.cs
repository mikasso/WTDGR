namespace Backend.Models
{
    public class User : IIdentifiable
    {
        public string Id { get; set; }
        public UserRole Role { get; set; }
        public string RoomId { get; set; }
        public string UserColor { get; set; }
    }
}
