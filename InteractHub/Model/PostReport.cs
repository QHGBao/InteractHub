using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.Model;

public class PostReport
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid PostId { get; set; }

    [Required]
    public Guid ReporterId { get; set; }

    // Spam, HateSpeech, Violence, Nudity, FakeNews, Other
    [Required]
    [MaxLength(50)]
    public string Reason { get; set; } = string.Empty;

    // Pending, Reviewed, Dismissed — Admin xử lý
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    [MaxLength(500)]
    public string? AdminNote { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("PostId")]
    public virtual Post Post { get; set; } = null!;

    [ForeignKey("ReporterId")]
    public virtual ApplicationUser Reporter { get; set; } = null!;
}