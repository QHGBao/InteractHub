namespace InteractHub.Service;
public interface ILikeService
{
    Task<object?> ToggleLike(Guid postId, Guid userId);
    Task<object?> GetLikes(Guid postId);
}