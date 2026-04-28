using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using InteractHub.Model;
using InteractHub.Data;
using InteractHub.DTOs.Story;

namespace InteractHub.Controllers;

[Route("api/stories")]
[ApiController]
[Authorize]
public class StoryController : ControllerBase
{
    private readonly AppDbContext _context;

    public StoryController(AppDbContext context)
    {
        _context = context;
    }

    // GET /api/stories — lấy tất cả story chưa hết hạn
    [HttpGet]
    public async Task<IActionResult> GetStories()
    {
        var now = DateTime.UtcNow;
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var stories = await _context.Stories
            .Include(s => s.Author)
            .Where(s => s.ExpiresAt > now)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new
            {
                id = s.Id,
                text = s.TextContent,
                imageUrl = s.MediaUrl,
                bg = s.Background ?? "",
                timeAgo = GetTimeAgo(s.CreatedAt),
                user = new
                {
                    id = s.Author.Id,
                    displayName = s.Author.DisplayName,
                    name = s.Author.UserName,
                    avatarUrl = s.Author.AvatarUrl
                }
            })
            .ToListAsync();

        return Ok(new { success = true, data = stories });
    }

    // POST /api/stories — tạo story mới
    [HttpPost]
    public async Task<IActionResult> CreateStory([FromForm] CreateStoryDto dto)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdValue))
            return Unauthorized();

        var userId = Guid.Parse(userIdValue);

        if (string.IsNullOrWhiteSpace(dto.TextContent) && dto.Image == null)
            return BadRequest(new { success = false, message = "Story phải có nội dung hoặc ảnh" });

        string? imageUrl = null;

        if (dto.Image != null)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid() + Path.GetExtension(dto.Image.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await dto.Image.CopyToAsync(stream);
            }

            imageUrl = $"/uploads/{fileName}";
        }

        var story = new Story
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TextContent = dto.TextContent,
            MediaUrl = imageUrl,
            Background = dto.Background,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        _context.Stories.Add(story);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, data = story });
    }

    // DELETE /api/stories/{id} — xoá story (chỉ chủ story)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteStory(Guid id)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdValue))
            return Unauthorized();

        var userId = Guid.Parse(userIdValue);

        var story = await _context.Stories.FindAsync(id);
        if (story == null)
            return NotFound(new { success = false, message = "Không tìm thấy story" });

        if (story.UserId != userId)
            return Forbid();

        _context.Stories.Remove(story);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Đã xoá story" });
    }

    private static string GetTimeAgo(DateTime date)
    {
        var span = DateTime.UtcNow - date;
        if (span.TotalMinutes < 1) return "Vừa xong";
        if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes} phút trước";
        if (span.TotalHours < 24) return $"{(int)span.TotalHours} giờ trước";
        return $"{(int)span.TotalDays} ngày trước";
    }
}