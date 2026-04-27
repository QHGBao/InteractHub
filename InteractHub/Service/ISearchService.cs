using InteractHub.DTOs.Search;

namespace InteractHub.Service;

public interface ISearchService
{
    Task<IEnumerable<UserSearchResultDto>> SearchUsersAsync(string query);
    Task<IEnumerable<PostSearchResultDto>> SearchPostsAsync(string query);
}