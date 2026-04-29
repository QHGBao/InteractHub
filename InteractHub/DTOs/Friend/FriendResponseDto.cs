namespace InteractHub.DTOs.Friend;

public class FriendResponseDto
{
    public Guid FriendshipId { get; set; }
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string Status { get; set; } = string.Empty;  // Pending / Accepted
    public DateTime CreatedAt { get; set; }
}