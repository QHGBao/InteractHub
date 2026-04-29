using InteractHub.DTOs.Story;

public interface IStoryService
{
    // Tạo story mới
    Task<StoryDto> CreateStoryAsync(Guid userId, CreateStoryDto dto);

    // Lấy story của chính mình — dùng cho StoriesPage
    Task<List<StoryDto>> GetMyStoriesAsync(Guid userId);

    // Lấy story của bản thân + bạn bè — dùng cho Feed sau này
    Task<List<StoryDto>> GetFeedStoriesAsync(Guid userId);

    // Xoá story
    Task<bool> DeleteStoryAsync(Guid storyId, Guid userId);
}