using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace InteractHub.Model;

// Kế thừa IdentityUser để tích hợp ASP.NET Core Identity
// Đáp ứng yêu cầu B3: JWT Authentication với Identity
public class ApplicationUser : IdentityUser<Guid>
{
    [Required]
    [MaxLength(100)]
    public string DisplayName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? AvatarUrl { get; set; }

    [MaxLength(500)]
    public string? CoverUrl { get; set; }

    [MaxLength(300)]
    public string? Bio { get; set; }

    // "User" hoặc "Admin" — đáp ứng yêu cầu B3: Role-based authorization
    public string Role { get; set; } = "User";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(200)]
    public string? School { get; set; }

    [MaxLength(10)]
    public string? Gender { get; set; }  // "male" / "female" / "other"

    // Lưu tối đa 5 links dạng JSON string
    [MaxLength(1000)]
    public string? SocialLinks { get; set; }

    // Navigation properties
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<Like> Likes { get; set; } = new List<Like>();
    public virtual ICollection<Story> Stories { get; set; } = new List<Story>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual ICollection<PostReport> PostReports { get; set; } = new List<PostReport>();
    public virtual ICollection<Friendship> SentFriendRequests { get; set; } = new List<Friendship>();
    public virtual ICollection<Friendship> ReceivedFriendRequests { get; set; } = new List<Friendship>();
    public virtual ICollection<UserHashtag> FollowedHashtags { get; set; } = new List<UserHashtag>();
}