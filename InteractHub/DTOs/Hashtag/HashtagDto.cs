namespace InteractHub.DTOs.Hashtag;

public class HashtagDto
{
    public Guid   Id        { get; set; }
    public string? Name      { get; set; }
    public int    PostCount { get; set; }
    public bool   IsFollowed { get; set; }
}

public class FollowHashtagResultDto
{
    public Guid   HashtagId  { get; set; }
    public string? Name       { get; set; }
    public bool   IsFollowed { get; set; }
}