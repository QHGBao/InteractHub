using System.ComponentModel.DataAnnotations.Schema;

namespace InteractHub.Model;

// Bảng junction N-N giữa Post và Hashtag
// Dùng Composite Primary Key — cấu hình trong DbContext
public class PostHashtag
{
    public Guid PostId { get; set; }
    public Guid HashtagId { get; set; }

    [ForeignKey("PostId")]
    public virtual Post Post { get; set; } = null!;

    [ForeignKey("HashtagId")]
    public virtual Hashtag Hashtag { get; set; } = null!;
}
