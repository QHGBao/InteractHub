using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.Model;

public class Story
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [MaxLength(500)]
    public string? MediaUrl { get; set; }   // URL Azure Blob Storage

    [MaxLength(500)]
    public string? TextContent { get; set; }

    // Tự động hết hạn sau 24 giờ
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("UserId")]
    public virtual ApplicationUser Author { get; set; } = null!;
}