using System.ComponentModel.DataAnnotations;

namespace InteractHub.DTOs.User;

public class UpdateProfileDto
{
    [MaxLength(100)]
    public string? DisplayName { get; set; }

    [MaxLength(300)]
    public string? Bio { get; set; }

    [MaxLength(500)]
    public string? AvatarUrl { get; set; }

    [MaxLength(500)]
    public string? CoverUrl { get; set; }

    [MaxLength(200)]
    public string? School { get; set; }

    [MaxLength(10)]
    public string? Gender { get; set; }

    [MaxLength(1000)]
    public string? SocialLinks { get; set; }
}