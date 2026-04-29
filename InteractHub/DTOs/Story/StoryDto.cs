using InteractHub.DTOs.Story;

namespace InteractHub.DTOs.Story;

public class StoryDto
{
    public Guid Id { get; set; }

    public string? TextContent { get; set; }

    public string? MediaUrl { get; set; }

    public string? Background { get; set; }

    public DateTime CreatedAt { get; set; }

    public Guid UserId { get; set; }

    public UserDto? User { get; set; }
}