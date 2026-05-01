using InteractHub.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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

    [HttpGet("users")]
    public async Task<IActionResult> SearchUsers([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new { success = true, data = Array.Empty<object>() });

        var currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var results = await _searchService.SearchUsersAsync(q, currentUserId);
        return Ok(new { success = true, data = results });
    }

    [HttpGet("posts")]
    public async Task<IActionResult> SearchPosts([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new { success = true, data = Array.Empty<object>() });

        var results = await _searchService.SearchPostsAsync(q);
        return Ok(new { success = true, data = results });
    }
}