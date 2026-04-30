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

    // ─────────────────────────────────────────────
    // SEARCH USERS
    // Trả về:
    //   - IsSelf = true nếu là chính mình
    //   - FriendshipStatus: null / "Pending" / "Accepted"
    // ─────────────────────────────────────────────
    public async Task<IEnumerable<UserSearchResultDto>> SearchUsersAsync(string query, Guid currentUserId)
    {
        var q = query.Trim().ToLower();

        var users = await _context.Users
            .Where(u => u.IsActive &&
                (u.DisplayName.ToLower().Contains(q) ||
                 (u.UserName != null && u.UserName.ToLower().Contains(q)) ||
                 (u.Bio      != null && u.Bio.ToLower().Contains(q))))
            .OrderBy(u => u.DisplayName)
            .Take(30)
            .Select(u => new { u.Id, u.DisplayName, u.UserName, u.AvatarUrl, u.Bio })
            .ToListAsync();

        if (!users.Any()) return Enumerable.Empty<UserSearchResultDto>();

        // Lấy toàn bộ friendship liên quan đến currentUser và các user tìm được
        var userIds = users.Select(u => u.Id).ToList();

        var friendships = await _context.Friendships
            .Where(f =>
                (f.RequesterId == currentUserId && userIds.Contains(f.AddresseeId)) ||
                (f.AddresseeId == currentUserId && userIds.Contains(f.RequesterId)))
            .Select(f => new
            {
                OtherId = f.RequesterId == currentUserId ? f.AddresseeId : f.RequesterId,
                f.Status
            })
            .ToListAsync();

        var friendshipMap = friendships.ToDictionary(f => f.OtherId, f => f.Status);

        return users.Select(u => new UserSearchResultDto
        {
            Id          = u.Id,
            DisplayName = u.DisplayName,
            UserName    = u.UserName,
            AvatarUrl   = u.AvatarUrl,
            Bio         = u.Bio,
            IsSelf      = u.Id == currentUserId,
            FriendshipStatus = friendshipMap.TryGetValue(u.Id, out var status) ? status : null
        });
    }

    // ─────────────────────────────────────────────
    // SEARCH POSTS — theo nội dung
    // ─────────────────────────────────────────────
    public async Task<IEnumerable<PostSearchResultDto>> SearchPostsAsync(string query)
    {
        var q = query.Trim().ToLower();

        return await _context.Posts
            .Include(p => p.Author)
            .Where(p => p.Content.ToLower().Contains(q))
            .OrderByDescending(p => p.CreatedAt)
            .Take(20)
            .Select(p => new PostSearchResultDto
            {
                Id            = p.Id,
                Content       = p.Content,
                ImageUrl      = p.ImageUrl,
                CreatedAt     = p.CreatedAt,
                LikesCount    = p.LikesCount,
                CommentsCount = p.CommentsCount,
                Author = new UserSearchResultDto
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