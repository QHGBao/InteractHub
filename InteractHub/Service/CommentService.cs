using InteractHub.Data;
using InteractHub.DTOs.Post;
using InteractHub.Model;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Service;

public class CommentService : ICommentService
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;
    public CommentService(AppDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }
    public async Task<object?> GetComments(Guid postId)
    {
        var post = await _context.Posts.FindAsync(postId);
        if (post == null || post.IsDeleted)
        {
            return null;
        }
        var comments = await _context.Comments
        .Where(c => c.PostId == postId && !c.IsDeleted && c.ParentCommentId == null)
        .Include(c => c.Author)
        .Include(c => c.Replies.Where(r => !r.IsDeleted))
            .ThenInclude(r => r.Author)
        .OrderByDescending(c => c.CreatedAt)
        .Select(c => new
        {
            c.Id,
            c.Content,
            c.CreatedAt,
            Author = new { c.Author.Id, c.Author.UserName, c.Author.DisplayName, c.Author.AvatarUrl },
            Replies = c.Replies.Select(r => new
            {
                r.Id,
                r.Content,
                r.CreatedAt,
                Author = new { r.Author.Id, r.Author.UserName, r.Author.DisplayName, r.Author.AvatarUrl }
            })
        }).ToListAsync();
        return comments;
    }

    public async Task<object?> CreateComment(Guid userId, Guid postId, CreateCommentDto dto)
    {
        var post = await _context.Posts.FindAsync(postId);
        if (post == null || post.IsDeleted)
            return null;

        // Nếu có parentCommentId, check nó có tồn tại không
        if (dto.ParentCommentId.HasValue)
        {
            var parentExist = await _context.Comments
            .AnyAsync(c => c.Id == dto.ParentCommentId.Value && !c.IsDeleted);
            if (!parentExist)
            {
                return null;
            }
        }
        var comment = new Comment
        {
            PostId = postId,
            UserId = userId,
            ParentCommentId = dto.ParentCommentId,
            Content = dto.Content
        };
        _context.Comments.Add(comment);

        post.CommentsCount++;
        await _context.SaveChangesAsync();

        // Load lại author
        await _context.Entry(comment).Reference(c => c.Author).LoadAsync();

        var actor = await _context.Users.FindAsync(userId);
        var actorName = actor?.DisplayName ?? "Ai đó";

        // Thông báo cho chủ bài
        if (post.UserId != userId && !dto.ParentCommentId.HasValue)
        {
            await _notificationService.CreateAndSendAsync(
                userId: post.UserId,
                actorId: userId,
                type: "Comment",
                message: $"{actorName} đã bình luận về bài viết của bạn",
                referenceId: postId
            );
        }

        // Thông báo cho chủ comment cha
        if (dto.ParentCommentId.HasValue)
        {
            var parentComment = await _context.Comments.FindAsync(dto.ParentCommentId.Value);
            if (parentComment != null && parentComment.UserId != userId)
            {
                await _notificationService.CreateAndSendAsync(
                    userId: parentComment.UserId,
                    actorId: userId,
                    type: "Comment",
                    message: $"{actorName} đã trả lời bình luận của bạn",
                    referenceId: postId
                );
            }
        }

        return new
        {
            comment.Id,
            comment.Content,
            comment.CreatedAt,
            comment.ParentCommentId,
            Author = new
            {
                comment.Author.Id,
                comment.Author.UserName,
                comment.Author.DisplayName,
                comment.Author.AvatarUrl
            }
        };
    }
    public async Task<bool> DeleteComment(Guid userId, Guid postId, Guid commentId)
    {
        var post = await _context.Posts.FindAsync(postId);
        var comment = await _context.Comments
        .Include(c => c.Post)
        .FirstOrDefaultAsync(c => c.Id == commentId && c.PostId == postId);
        if (post == null || post.IsDeleted)
            return false;

        if (comment == null || comment.IsDeleted)
            return false;

        if (post.UserId != userId && comment.UserId != userId)
            return false;
        // TODO: Check authorization
        comment.IsDeleted = true;
        comment.Post.CommentsCount--;
        await _context.SaveChangesAsync();
        return true;

    }
}