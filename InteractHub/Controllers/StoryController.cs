using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using InteractHub.DTOs.Story;
using InteractHub.Service;

namespace InteractHub.Controllers;

[Route("api/stories")]
[ApiController]
[Authorize]
public class StoryController : ControllerBase
{
    private readonly IStoryService _storyService;

    public StoryController(IStoryService storyService)
    {
        _storyService = storyService;
    }

    [HttpGet]
    public async Task<IActionResult> GetStories()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var data = await _storyService.GetMyStoriesAsync(userId);

        return Ok(new { success = true, data });
    }

    [HttpGet("feed")]
    public async Task<IActionResult> GetFeed()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var data = await _storyService.GetFeedStoriesAsync(userId);

        return Ok(new { success = true, data });
    }

    [HttpPost]
    public async Task<IActionResult> CreateStory([FromForm] CreateStoryDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        if (string.IsNullOrWhiteSpace(dto.TextContent) && dto.Image == null)
            return BadRequest(new { success = false, message = "Cần có nội dung hoặc ảnh" });

        var result = await _storyService.CreateStoryAsync(userId, dto);

        return Ok(new { success = true, data = result });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStory(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var ok = await _storyService.DeleteStoryAsync(id, userId);

        if (!ok)
            return NotFound(new { success = false, message = "Không tìm thấy hoặc không có quyền xoá" });

        return Ok(new { success = true });
    }
}