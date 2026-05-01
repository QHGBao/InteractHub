using InteractHub.DTOs.Hashtag;

namespace InteractHub.Service;

public interface IHashtagService
{
    Task<List<HashtagDto>> GetTrendingAsync(Guid userId, int top = 10);
    Task<List<HashtagDto>> GetFollowedAsync(Guid userId);
    Task<FollowHashtagResultDto> ToggleFollowAsync(Guid userId, Guid hashtagId);
    Task<List<HashtagDto>> SearchAsync(string query, Guid userId);
    Task<object> GetPostsByHashtagAsync(string tag, int page, int pageSize);
}