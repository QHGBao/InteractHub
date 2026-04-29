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
}