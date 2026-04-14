using System.ComponentModel.DataAnnotations;

namespace InteractHub.Model;

public class Hashtag
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;  // Không có dấu #

    public int PostCount { get; set; } = 0;  // Dùng cho trending

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ICollection<PostHashtag> PostHashtags { get; set; } = new List<PostHashtag>();
    public virtual ICollection<UserHashtag> UserHashtags { get; set; } = new List<UserHashtag>();
}