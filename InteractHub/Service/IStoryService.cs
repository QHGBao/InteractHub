using InteractHub.DTOs.Story;

namespace InteractHub.Service;

public interface IStoryService
{
    Task<object> CreateStoryAsync(Guid userId, CreateStoryDto dto);
    Task<IEnumerable<object>> GetStoriesAsync();
}