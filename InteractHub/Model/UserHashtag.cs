using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.Model;

// Bảng junction N-N: User theo dõi Hashtag
public class UserHashtag
{
    public Guid UserId { get; set; }
    public Guid HashtagId { get; set; }
    public DateTime FollowedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey("UserId")]
    public virtual ApplicationUser User { get; set; } = null!;

    [ForeignKey("HashtagId")]
    public virtual Hashtag Hashtag { get; set; } = null!;
}