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
                Id         = h.Id,
                Name       = h.Name,
                PostCount  = h.PostCount,
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
                Id         = uh.Hashtag.Id,
                Name       = uh.Hashtag.Name,
                PostCount  = uh.Hashtag.PostCount,
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
                UserId    = userId,
                HashtagId = hashtagId,
                FollowedAt = DateTime.UtcNow
            });
            isFollowed = true;
        }

        await _context.SaveChangesAsync();

        return new FollowHashtagResultDto
        {
            HashtagId  = hashtag.Id,
            Name       = hashtag.Name,
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
                Id         = h.Id,
                Name       = h.Name,
                PostCount  = h.PostCount,
                IsFollowed = followedIds.Contains(h.Id)
            })
            .ToListAsync();
    }
}