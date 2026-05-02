namespace InteractHub.DTOs;

public class ShareNotificationDto
{
    public Guid PostId { get; set; }
    public Guid NewPostId { get; set; }
    public Guid PostOwnerId { get; set; }
}