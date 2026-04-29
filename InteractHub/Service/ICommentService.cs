using InteractHub.DTOs.Post;

namespace InteractHub.Service;
public interface ICommentService
{
    Task<object?> GetComments(Guid postId);
    Task<object?> CreateComment(Guid userId, Guid postId, CreateCommentDto dto);
    Task<bool> DeleteComment(Guid userId, Guid postId, Guid commentId);
}