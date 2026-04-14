using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.Model;

public class Friendship
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid RequesterId { get; set; }   // Người gửi lời mời

    [Required]
    public Guid AddresseeId { get; set; }   // Người nhận lời mời

    // Trạng thái: Pending, Accepted, Blocked
    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation properties — 2 FK riêng biệt vì cùng trỏ về User
    [ForeignKey("RequesterId")]
    public virtual ApplicationUser Requester { get; set; } = null!;

    [ForeignKey("AddresseeId")]
    public virtual ApplicationUser Addressee { get; set; } = null!;
}