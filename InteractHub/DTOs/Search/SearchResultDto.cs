namespace InteractHub.DTOs.Search;

public class UserSearchResultDto
{
    public Guid    Id          { get; set; }
    public string  DisplayName { get; set; } = string.Empty;
    public string? UserName    { get; set; }
    public string? AvatarUrl   { get; set; }
    public string? Bio         { get; set; }
    public bool    IsSelf      { get; set; }
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
    public UserSearchResultDto Author { get; set; } = null!;
}