using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.Model;

public class Post
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Content { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    // Đếm sẵn để tránh COUNT(*) mỗi lần query
    public int LikesCount { get; set; } = 0;
    public int CommentsCount { get; set; } = 0;

    // Soft delete — không xóa thật khỏi DB
    public bool IsDeleted { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Model/Post.cs - thêm các field sau
    public Guid? SharedPostId { get; set; }
    public Post? SharedPost { get; set; }  // Navigation property
    
    // Navigation properties
    [ForeignKey("UserId")]
    public virtual ApplicationUser Author { get; set; } = null!;
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<Like> Likes { get; set; } = new List<Like>();
    public virtual ICollection<PostHashtag> PostHashtags { get; set; } = new List<PostHashtag>();
    public virtual ICollection<PostReport> Reports { get; set; } = new List<PostReport>();
}