namespace InteractHub.DTOs.Search;

public class UserSearchResultDto
{
    public Guid    Id          { get; set; }
    public string  DisplayName { get; set; } = string.Empty;
    public string? UserName    { get; set; }
    public string? AvatarUrl   { get; set; }
    public string? Bio         { get; set; }

    // true nếu đây chính là user đang đăng nhập
    public bool    IsSelf      { get; set; }

    // null = chưa có quan hệ, "Pending" = đã gửi/nhận lời mời, "Accepted" = đã bạn bè
    public string? FriendshipStatus { get; set; }
}

public class PostSearchResultDto
{
    public Guid     Id            { get; set; }
    public string?  Content       { get; set; }
    public string?  ImageUrl      { get; set; }
    public DateTime CreatedAt     { get; set; } 
    public int      LikesCount    { get; set; }
    public int      CommentsCount { get; set; }

    // ✅ PostCard đọc post.author — đổi User → Author
    public UserSearchResultDto Author { get; set; } = null!;
}