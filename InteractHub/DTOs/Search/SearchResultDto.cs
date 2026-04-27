namespace InteractHub.DTOs.Search;

public class UserSearchResultDto
{
    public Guid   Id          { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? UserName   { get; set; }
    public string? AvatarUrl  { get; set; }
    public string? Bio        { get; set; }
}

public class PostSearchResultDto
{
    public Guid    Id            { get; set; }
    public string? Content       { get; set; }
    public string? ImageUrl      { get; set; }
    public string  TimeAgo       { get; set; } = string.Empty;
    public int     LikesCount    { get; set; }
    public int     CommentsCount { get; set; }
    public UserSearchResultDto User { get; set; } = null!;
}