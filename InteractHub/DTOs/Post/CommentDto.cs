using System.ComponentModel.DataAnnotations;
namespace InteractHub.DTOs.Post;
public record CreateCommentDto
{
    [Required]
    [MaxLength(1000)]
    public string Content {get; set;} = string.Empty;
    public Guid? ParentCommentId {get; set;}
}