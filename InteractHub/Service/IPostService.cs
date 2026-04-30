using InteractHub.DTOs.Post;

namespace InteractHub.Service;
public interface IPostService{
    Task<object> GetPosts(int page, int pageSize);
    Task<object?> GetPost(Guid id);
    Task<object> CreatePost(Guid userId,CreatePostDto dto);
    Task<bool> UpdatePost(Guid userId, Guid postId,UpdatePostDto dto);
    Task<bool> DeletePost(Guid userId, Guid postId);
    Task<object> GetPostsByUser(Guid userId, int page, int pageSize);
}