// POST   /api/posts/{postId}/like    → Toggle like (like/unlike)
// GET    /api/posts/{postId}/likes   → Danh sách users đã like

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using InteractHub.Data;
using InteractHub.Model;

namespace InteractHub.Controllers;
[ApiController]
[Route("api/posts/{postId}")]
public class LikesController : ControllerBase{
    private readonly AppDbContext _context;
    public LikesController(AppDbContext context){
        _context = context;
    }

    [HttpPost("like")]
    public async Task<ActionResult<object>> ToggleLike(Guid postId){
        var post = await _context.Posts.FindAsync(postId);
        if (post == null || post.IsDeleted){
            return NotFound(new {message = "Post not found"});
        }
        // TODO: Get userId from auth
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var existingLike = await _context.Likes
        .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);
        bool isLiked;
        if (existingLike != null){
            // Unlike
            _context.Likes.Remove(existingLike);
            post.LikesCount--;
            isLiked = false;
        }
        else{
            var like = new Like{
                PostId = postId,
                UserId = userId
            };
            _context.Likes.Add(like);
            post.LikesCount++;
            isLiked = true;
        }
        await _context.SaveChangesAsync();
        return Ok(new {isLiked, likesCount = post.LikesCount});

    }

    [HttpGet("likes")]
    public async Task<ActionResult<object>> GetLikes(Guid postId){
        var post = await _context.Posts.FindAsync(postId);
        if(post == null || post.IsDeleted){
            return NotFound(new {message = "Post not found"});
        }
        var likes = await _context.Likes
        .Where(l => l.PostId == postId)
        .Include(l => l.User)
        .Select(l => new {
            l.User.Id,
            l.User.UserName,
            l.CreatedAt
        }).ToListAsync();
        return Ok(new {totalLike = likes.Count, users = likes});
    }
}