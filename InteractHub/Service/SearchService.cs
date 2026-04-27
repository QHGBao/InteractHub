using InteractHub.Data;
using InteractHub.DTOs.Search;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Service;

public class SearchService : ISearchService
{
    private readonly AppDbContext _context;

    public SearchService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<UserSearchResultDto>> SearchUsersAsync(string query)
    {
        var q = query.Trim().ToLower();

        return await _context.Users
            .Where(u => u.IsActive &&
                (u.DisplayName.ToLower().Contains(q) ||
                 (u.UserName != null && u.UserName.ToLower().Contains(q)) ||
                 (u.Bio      != null && u.Bio.ToLower().Contains(q))))
            .OrderBy(u => u.DisplayName)
            .Take(20)
            .Select(u => new UserSearchResultDto
            {
                Id          = u.Id,
                DisplayName = u.DisplayName,
                UserName    = u.UserName,
                AvatarUrl   = u.AvatarUrl,
                Bio         = u.Bio,
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<PostSearchResultDto>> SearchPostsAsync(string query)
    {
        var q = query.Trim().ToLower();

        return await _context.Posts
            .Include(p => p.Author)
            .Include(p => p.Likes)
            .Include(p => p.Comments)
            .Where(p => p.Content != null && p.Content.ToLower().Contains(q))
            .OrderByDescending(p => p.CreatedAt)
            .Take(20)
            .Select(p => new PostSearchResultDto
            {
                Id            = p.Id,
                Content       = p.Content,
                ImageUrl      = p.ImageUrl,
                TimeAgo       = GetTimeAgo(p.CreatedAt),
                LikesCount    = p.Likes.Count,
                CommentsCount = p.Comments.Count,
                User = new UserSearchResultDto
                {
                    Id          = p.Author.Id,
                    DisplayName = p.Author.DisplayName,
                    UserName    = p.Author.UserName,
                    AvatarUrl   = p.Author.AvatarUrl,
                }
            })
            .ToListAsync();
    }

    private static string GetTimeAgo(DateTime date)
    {
        var span = DateTime.UtcNow - date;
        if (span.TotalMinutes < 1)  return "Vừa xong";
        if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes} phút trước";
        if (span.TotalHours   < 24) return $"{(int)span.TotalHours} giờ trước";
        return $"{(int)span.TotalDays} ngày trước";
    }
}