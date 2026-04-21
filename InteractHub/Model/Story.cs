using InteractHub.Model;

namespace InteractHub.Model;

public class Story
{
    public Guid Id { get; set; }

    public string? TextContent { get; set; }
    public string? MediaUrl { get; set; }
    public string? Background { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }

    public Guid UserId { get; set; }

    // FIX lỗi EF snapshot đang cần Author
    public ApplicationUser Author { get; set; } = null!;
}