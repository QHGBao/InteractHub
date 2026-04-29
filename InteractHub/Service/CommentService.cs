using InteractHub.Data;
using InteractHub.DTOs.Post;
using InteractHub.Model;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Service;
public class CommentService : ICommentService
{
    private readonly AppDbContext _context;

    public CommentService(AppDbContext context)
    {
        _context = context;
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
            Author = new { c.Author.Id, c.Author.UserName },
            Replies = c.Replies.Select(r => new
            {
                r.Id,
                r.Content,
                r.CreatedAt,
                Author = new { r.Author.Id, r.Author.UserName }
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
        return new
        {
            comment.Id,
            comment.Content,
            comment.CreatedAt,
            comment.ParentCommentId,
            Author = new
            {
                comment.Author.Id,
                comment.Author.UserName
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