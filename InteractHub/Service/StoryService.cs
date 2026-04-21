using InteractHub.Data;
using InteractHub.DTOs.Story;
using InteractHub.Model;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Service;

public class StoryService
{
    private readonly AppDbContext _context;

    public StoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Story> CreateStoryAsync(CreateStoryDto dto, Guid userId, string? imageUrl = null)
    {
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

        return story;
    }

    public async Task<List<Story>> GetStoriesAsync()
    {
        return await _context.Stories
            .Include(s => s.Author)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public async Task DeleteExpiredStoriesAsync()
    {
        var now = DateTime.UtcNow;
        var expired = await _context.Stories
            .Where(s => s.ExpiresAt < now)
            .ToListAsync();

        _context.Stories.RemoveRange(expired);
        await _context.SaveChangesAsync();
    }
}