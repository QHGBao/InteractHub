// GET    /api/posts/{postId}/comments                        → Comments của 1 post
// POST   /api/posts/{postId}/comments                        → Thêm comment
// DELETE /api/posts/{postId}/comments/{commentId}            → Xóa comment

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using InteractHub.Data;
using InteractHub.Model;
using InteractHub.DTOs.Post;

namespace InteractHub.Controllers;
[ApiController]
[Route ("api/posts/{postId}/comments")]
public class CommentsController : ControllerBase{
    private readonly AppDbContext _context;
    public CommentsController(AppDbContext context){
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetComments(Guid postId){
        var post = await _context.Posts.FindAsync(postId);
        if (post == null || post.IsDeleted){
            return NotFound(new {message = "Post not found"});
        }
        var comments = await _context.Comments
        .Where(c => c.PostId == postId && !c.IsDeleted && c.ParentCommentId == null)
        .Include(c => c.Author)
        .Include(c => c.Replies.Where(r => !r.IsDeleted))
            .ThenInclude(r => r.Author)
        .OrderByDescending(c => c.CreatedAt)
        .Select(c => new {
            c.Id,
            c.Content,
            c.CreatedAt,
            Author = new {c.Author.Id, c.Author.UserName},
            Replies = c.Replies.Select(r => new{
                r.Id,
                r.Content,
                r.CreatedAt,
                Author = new {r.Author.Id, r.Author.UserName}
            })
        }).ToListAsync();
        return Ok(comments);
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreateComment(
        Guid postId,
        [FromBody] CreateCommentDto dto)
    {
        var post = await _context.Posts.FindAsync(postId);
        if (post == null || post.IsDeleted)
            return NotFound(new {message = "Post not found"});
        // var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var userId = Guid.Parse("4db5c6b3-607a-4099-692e-08de9c30adf0");
        // Nếu có parentCommentId, check nó có tồn tại không
        if (dto.ParentCommentId.HasValue){
            var parentExist = await _context.Comments
            .AnyAsync(c => c.Id == dto.ParentCommentId.Value && !c.IsDeleted);
            if(!parentExist){
                return BadRequest(new {message = "Parent comment not found"});
            }
        }
        var comment = new Comment{
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
        return CreatedAtAction(nameof(GetComments), new {postId}, new {
            comment.Id,
            comment.Content,
            comment.CreatedAt,
            comment.ParentCommentId,
            Author = new {
                comment.Author.Id,
                comment.Author.UserName
            }
        });
    }

    // DELETE /api/posts/{postId}/comments/{commentId}
    [HttpDelete("{commentId}")]
    public async Task<ActionResult<object>> DeleteComment(Guid postId, Guid commentId){
        var comment = await _context.Comments
        .Include(c => c.Post)
        .FirstOrDefaultAsync(c => c.Id == commentId && c.PostId == postId);
        if (comment == null || comment.IsDeleted)
            return NotFound();
        // TODO: Check authorization
        comment.IsDeleted = true;
        comment.Post.CommentsCount--;
        await _context.SaveChangesAsync();
        return NoContent();
    }

}