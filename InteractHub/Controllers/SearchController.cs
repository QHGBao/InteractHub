using InteractHub.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.Controllers;

[Route("api/search")]
[ApiController]
[Authorize]
public class SearchController : ControllerBase
{
    private readonly ISearchService _searchService;

    public SearchController(ISearchService searchService)
    {
        _searchService = searchService;
    }

    // GET /api/search/users?q=keyword
    [HttpGet("users")]
    public async Task<IActionResult> SearchUsers([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new { success = true, data = Array.Empty<object>() });

        var results = await _searchService.SearchUsersAsync(q);
        return Ok(new { success = true, data = results });
    }

    // GET /api/search/posts?q=keyword
    [HttpGet("posts")]
    public async Task<IActionResult> SearchPosts([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new { success = true, data = Array.Empty<object>() });

        var results = await _searchService.SearchPostsAsync(q);
        return Ok(new { success = true, data = results });
    }
}