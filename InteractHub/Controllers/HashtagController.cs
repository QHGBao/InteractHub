using InteractHub.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InteractHub.Controllers;

[Route("api/hashtags")]
[ApiController]
[Authorize]
public class HashtagsController : ControllerBase
{
    private readonly IHashtagService _hashtagService;

    public HashtagsController(IHashtagService hashtagService)
    {
        _hashtagService = hashtagService;
    }

    [HttpGet("trending")]
    public async Task<IActionResult> GetTrending([FromQuery] int top = 10)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var data   = await _hashtagService.GetTrendingAsync(userId, top);
        return Ok(new { success = true, data });
    }

    [HttpGet("followed")]
    public async Task<IActionResult> GetFollowed()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var data   = await _hashtagService.GetFollowedAsync(userId);
        return Ok(new { success = true, data });
    }

    [HttpPost("{id}/follow")]
    public async Task<IActionResult> ToggleFollow(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _hashtagService.ToggleFollowAsync(userId, id);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new { success = true, data = Array.Empty<object>() });

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var data   = await _hashtagService.SearchAsync(q, userId);
        return Ok(new { success = true, data });
    }
}