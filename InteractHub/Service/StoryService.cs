using InteractHub.Data;
using InteractHub.DTOs.Story;
using InteractHub.Model;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Service;

public class StoryService : IStoryService
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public StoryService(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    // ─────────────────────────────────────────────
    // CREATE
    // ─────────────────────────────────────────────
    public async Task<StoryDto> CreateStoryAsync(Guid userId, CreateStoryDto dto)
    {
        string? imageUrl = null;

        if (dto.Image != null)
        {
            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid() + Path.GetExtension(dto.Image.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
                await dto.Image.CopyToAsync(stream);

            imageUrl = $"/uploads/{fileName}";
        }

        var story = new Story
        {
            Id        = Guid.NewGuid(),
            UserId    = userId,
            TextContent = dto.TextContent,
            MediaUrl  = imageUrl,
            Background = dto.Background,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        _context.Stories.Add(story);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        return MapToDto(story, user);
    }

    // ─────────────────────────────────────────────
    // GET MY STORIES — chỉ story của chính mình
    // Dùng cho StoriesPage
    // ─────────────────────────────────────────────
    public async Task<List<StoryDto>> GetMyStoriesAsync(Guid userId)
    {
        var now = DateTime.UtcNow;

        return await _context.Stories
            .Include(s => s.Author)
            .Where(s => s.UserId == userId && s.ExpiresAt > now)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new StoryDto
            {
                Id          = s.Id,
                TextContent = s.TextContent,
                MediaUrl    = s.MediaUrl,
                Background  = s.Background,
                CreatedAt   = s.CreatedAt,
                UserId      = s.UserId,
                User = s.Author == null ? null : new UserDto
                {
                    Id          = s.Author.Id,
                    DisplayName = s.Author.DisplayName,
                    AvatarUrl   = s.Author.AvatarUrl,
                    Bio         = s.Author.Bio
                }
            })
            .ToListAsync();
    }

    // ─────────────────────────────────────────────
    // GET FEED STORIES — bản thân + bạn bè
    // Dùng sau này khi có màn hình Feed
    // ─────────────────────────────────────────────
    public async Task<List<StoryDto>> GetFeedStoriesAsync(Guid userId)
    {
        var now = DateTime.UtcNow;

        // Lấy danh sách friendId đã accepted
        var friendIds = await _context.Friendships
            .Where(f => f.Status == "Accepted" &&
                        (f.RequesterId == userId || f.AddresseeId == userId))
            .Select(f => f.RequesterId == userId ? f.AddresseeId : f.RequesterId)
            .ToListAsync();

        // Gộp bản thân vào
        friendIds.Add(userId);

        return await _context.Stories
            .Include(s => s.Author)
            .Where(s => friendIds.Contains(s.UserId) && s.ExpiresAt > now)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new StoryDto
            {
                Id          = s.Id,
                TextContent = s.TextContent,
                MediaUrl    = s.MediaUrl,
                Background  = s.Background,
                CreatedAt   = s.CreatedAt,
                UserId      = s.UserId,
                User = s.Author == null ? null : new UserDto
                {
                    Id          = s.Author.Id,
                    DisplayName = s.Author.DisplayName,
                    AvatarUrl   = s.Author.AvatarUrl,
                    Bio         = s.Author.Bio
                }
            })
            .ToListAsync();
    }

    // ─────────────────────────────────────────────
    // DELETE
    // ─────────────────────────────────────────────
    public async Task<bool> DeleteStoryAsync(Guid storyId, Guid userId)
    {
        var story = await _context.Stories
            .FirstOrDefaultAsync(x => x.Id == storyId);

        if (story == null || story.UserId != userId)
            return false;

        _context.Stories.Remove(story);
        await _context.SaveChangesAsync();
        return true;
    }

    // ─────────────────────────────────────────────
    // HELPER
    // ─────────────────────────────────────────────
    private static StoryDto MapToDto(Story story, ApplicationUser? user) => new()
    {
        Id          = story.Id,
        TextContent = story.TextContent,
        MediaUrl    = story.MediaUrl,
        Background  = story.Background,
        CreatedAt   = story.CreatedAt,
        UserId      = story.UserId,
        User = user == null ? null : new UserDto
        {
            Id          = user.Id,
            DisplayName = user.DisplayName,
            AvatarUrl   = user.AvatarUrl,
            Bio         = user.Bio
        }
    };
}