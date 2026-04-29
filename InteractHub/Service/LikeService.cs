using InteractHub.Data;
using InteractHub.Model;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Service;

public class LikeService : ILikeService
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;

    public LikeService(AppDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }
    public async Task<object?> ToggleLike(Guid postId, Guid userId)
    {
        var post = await _context.Posts.FindAsync(postId);
        if (post == null || post.IsDeleted)
        {
            return null;
        }

        var existingLike = await _context.Likes
        .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);
        bool isLiked;
        if (existingLike != null)
        {
            // Unlike
            _context.Likes.Remove(existingLike);
            post.LikesCount--;
            isLiked = false;
        }
        else
        {
            var like = new Like
            {
                PostId = postId,
                UserId = userId
            };
            _context.Likes.Add(like);
            post.LikesCount++;
            isLiked = true;

            if (post.UserId != userId)
            {
                var actor = await _context.Users.FindAsync(userId);
                await _notificationService.CreateAndSendAsync(
                    userId: post.UserId,
                    actorId: userId,
                    type: "Like",
                    message: $"{actor?.DisplayName ?? "Ai đó"} đã thích bài viết của bạn",
                    referenceId: postId
                );
            }
        }
        await _context.SaveChangesAsync();
        return new { isLiked, likesCount = post.LikesCount };
    }

    public async Task<object?> GetLikes(Guid postId)
    {
        var post = await _context.Posts.FindAsync(postId);
        if (post == null || post.IsDeleted)
        {
            return null;
        }
        var likes = await _context.Likes
        .Where(l => l.PostId == postId)
        .Include(l => l.User)
        .Select(l => new
        {
            l.User.Id,
            l.User.UserName,
            l.CreatedAt
        }).ToListAsync();
        return new { totalLike = likes.Count, users = likes };
    }
}