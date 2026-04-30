using InteractHub.DTOs.Search;

namespace InteractHub.Service;

public interface ISearchService
{
    // currentUserId dùng để biết bản thân và trạng thái kết bạn
    Task<IEnumerable<UserSearchResultDto>> SearchUsersAsync(string query, Guid currentUserId);
    Task<IEnumerable<PostSearchResultDto>> SearchPostsAsync(string query);
}