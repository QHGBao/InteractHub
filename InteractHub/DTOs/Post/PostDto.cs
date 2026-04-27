using System.ComponentModel.DataAnnotations;
namespace InteractHub.DTOs;


public record CreatePostDto{
    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;
    [MaxLength(500)]
    public string? ImageUrl { get; set; }
}
public record UpdatePostDto{
    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;
    [MaxLength(500)]
    public string? ImageUrl { get; set; }
}
