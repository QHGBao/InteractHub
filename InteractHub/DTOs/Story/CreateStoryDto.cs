namespace InteractHub.DTOs.Story;

public class CreateStoryDto
{
    public string? TextContent { get; set; }
    public IFormFile? Image { get; set; }
    public string? Background { get; set; }
}