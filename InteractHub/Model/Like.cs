using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.Model;

public class Like
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [Required]
    public Guid PostId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual ApplicationUser User { get; set; } = null!;

    [ForeignKey("PostId")]
    public virtual Post Post { get; set; } = null!;
}