namespace InteractHub.DTOs.User;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string? UserName { get; set; }
    public int PostsCount { get; set; }
    public int FriendsCount { get; set; }
    public DateTime CreatedAt { get; set; }
}