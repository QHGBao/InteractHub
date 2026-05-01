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

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("trending")]
    public async Task<IActionResult> GetTrending([FromQuery] int top = 10)
    {
        var data = await _hashtagService.GetTrendingAsync(GetUserId(), top);
        return Ok(new { success = true, data });
    }

    [HttpGet("followed")]
    public async Task<IActionResult> GetFollowed()
    {
        var data = await _hashtagService.GetFollowedAsync(GetUserId());
        return Ok(new { success = true, data });
    }

    [HttpPost("{id}/follow")]
    public async Task<IActionResult> ToggleFollow(Guid id)
    {
        var result = await _hashtagService.ToggleFollowAsync(GetUserId(), id);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return Ok(new { success = true, data = Array.Empty<object>() });

        var data = await _hashtagService.SearchAsync(q, GetUserId());
        return Ok(new { success = true, data });
    }

    [HttpGet("{tag}/posts")]
    public async Task<IActionResult> GetPostsByHashtag(
        string tag,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var data = await _hashtagService.GetPostsByHashtagAsync(tag, page, pageSize, GetUserId());
        return Ok(new { success = true, data });
    }
}