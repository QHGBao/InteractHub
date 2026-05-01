using InteractHub.Data;
using InteractHub.DTOs.Hashtag;
using InteractHub.Model;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Service;

public class HashtagService : IHashtagService
{
    private readonly AppDbContext _context;
    public HashtagService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<HashtagDto>> GetTrendingAsync(Guid userId, int top = 10)
    {
        var followedIds = await _context.UserHashtags
            .Where(uh => uh.UserId == userId)
            .Select(uh => uh.HashtagId)
            .ToListAsync();

        return await _context.Hashtags
            .OrderByDescending(h => h.PostCount)
            .Take(top)
            .Select(h => new HashtagDto
            {
                Id = h.Id,
                Name = h.Name,
                PostCount = h.PostCount,
                IsFollowed = followedIds.Contains(h.Id)
            })
            .ToListAsync();
    }

    public async Task<List<HashtagDto>> GetFollowedAsync(Guid userId)
    {
        return await _context.UserHashtags
            .Include(uh => uh.Hashtag)
            .Where(uh => uh.UserId == userId)
            .OrderByDescending(uh => uh.Hashtag.PostCount)
            .Select(uh => new HashtagDto
            {
                Id = uh.Hashtag.Id,
                Name = uh.Hashtag.Name,
                PostCount = uh.Hashtag.PostCount,
                IsFollowed = true
            })
            .ToListAsync();
    }

    public async Task<FollowHashtagResultDto> ToggleFollowAsync(Guid userId, Guid hashtagId)
    {
        var hashtag = await _context.Hashtags.FindAsync(hashtagId)
            ?? throw new Exception("Hashtag không tồn tại");

        var existing = await _context.UserHashtags
            .FirstOrDefaultAsync(uh => uh.UserId == userId && uh.HashtagId == hashtagId);

        bool isFollowed;

        if (existing != null)
        {
            _context.UserHashtags.Remove(existing);
            isFollowed = false;
        }
        else
        {
            _context.UserHashtags.Add(new UserHashtag
            {
                UserId = userId,
                HashtagId = hashtagId,
                FollowedAt = DateTime.UtcNow
            });
            isFollowed = true;
        }

        await _context.SaveChangesAsync();

        return new FollowHashtagResultDto
        {
            HashtagId = hashtag.Id,
            Name = hashtag.Name,
            IsFollowed = isFollowed
        };
    }

    public async Task<List<HashtagDto>> SearchAsync(string query, Guid userId)
    {
        var q = query.Trim().ToLower().TrimStart('#');

        var followedIds = await _context.UserHashtags
            .Where(uh => uh.UserId == userId)
            .Select(uh => uh.HashtagId)
            .ToListAsync();

        return await _context.Hashtags
            .Where(h => h.Name.ToLower().Contains(q))
            .OrderByDescending(h => h.PostCount)
            .Take(10)
            .Select(h => new HashtagDto
            {
                Id = h.Id,
                Name = h.Name,
                PostCount = h.PostCount,
                IsFollowed = followedIds.Contains(h.Id)
            })
            .ToListAsync();
    }


    public async Task<object> GetPostsByHashtagAsync(string tag, int page, int pageSize)
    {
        var normalizedTag = tag.TrimStart('#').ToLower();
        var hashtag = await _context.Hashtags
            .FirstOrDefaultAsync(h => h.Name!.ToLower() == normalizedTag);
        if (hashtag == null)
            return new { posts = Array.Empty<object>(), totalPages = 0, totalCount = 0 };
        var query = _context.Posts
            .Where(p => !p.IsDeleted &&
                        p.Content != null &&
                        p.Content.ToLower().Contains("#" + normalizedTag))
            .Include(p => p.Author)
            .OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync();
        var posts = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
        var formattedPosts = posts.Select(p => new
        {
            p.Id,
            p.Content,
            p.ImageUrl,
            p.LikesCount,
            p.CommentsCount,
            createdAt = DateTime.SpecifyKind(p.CreatedAt, DateTimeKind.Utc).ToString("o"),
            author = new
            {
                id = p.Author.Id,
                userName = p.Author.UserName,
                displayName = p.Author.DisplayName,
                avatarUrl = p.Author.AvatarUrl
            }
        }).ToList();
        return new
        {
            posts = formattedPosts,
            totalCount,
            page,
            pageSize,
            totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }
}
