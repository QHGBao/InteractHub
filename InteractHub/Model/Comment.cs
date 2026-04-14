using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.Model;

public class Comment
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid PostId { get; set; }

    [Required]
    public Guid UserId { get; set; }

    // Null = comment gốc, có giá trị = reply của comment khác
    public Guid? ParentCommentId { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Content { get; set; } = string.Empty;

    public bool IsDeleted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual ApplicationUser Author { get; set; } = null!;

    [ForeignKey("PostId")]
    public virtual Post Post { get; set; } = null!;

    // Self-referencing: comment cha → nhiều replies con
    [ForeignKey("ParentCommentId")]
    public virtual Comment? ParentComment { get; set; }
    public virtual ICollection<Comment> Replies { get; set; } = new List<Comment>();
}