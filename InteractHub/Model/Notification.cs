using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.Model;

public class Notification
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }        // Người nhận thông báo

    public Guid? ActorId { get; set; }      // Người tạo ra thông báo

    // Like, Comment, FriendRequest, FriendAccepted, Mention
    [Required]
    [MaxLength(30)]
    public string Type { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string Message { get; set; } = string.Empty;

    public Guid? ReferenceId { get; set; }  // Id Post/Comment liên quan

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public virtual ApplicationUser Recipient { get; set; } = null!;

    [ForeignKey("ActorId")]
    public virtual ApplicationUser? Actor { get; set; }
}