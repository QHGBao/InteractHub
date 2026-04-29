// GET    /api/posts/{postId}/comments                        → Comments của 1 post
// POST   /api/posts/{postId}/comments                        → Thêm comment
// DELETE /api/posts/{postId}/comments/{commentId}            → Xóa comment

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using InteractHub.Data;
using InteractHub.Model;
using InteractHub.DTOs.Post;
using InteractHub.Service;

namespace InteractHub.Controllers;
[ApiController]
[Authorize]
[Route ("api/posts/{postId}/comments")]
public class CommentsController : ControllerBase{
    private readonly ICommentService _commentService;
    public CommentsController(ICommentService commentService){
        _commentService = commentService;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetComments(Guid postId){
        var result = await _commentService.GetComments(postId);
        if (result == null) return NotFound(new {message = "Post not found"});
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<object>> CreateComment(
        Guid postId,
        [FromBody] CreateCommentDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _commentService.CreateComment(userId, postId, dto);
        if (result == null) return BadRequest(new {message = "Parent comment not found"});
        return CreatedAtAction(nameof(GetComments), new {postId}, result);
    }

    // DELETE /api/posts/{postId}/comments/{commentId}
    [HttpDelete("{commentId}")]
    public async Task<ActionResult<object>> DeleteComment(Guid postId, Guid commentId){
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _commentService.DeleteComment(userId, postId, commentId);
        if(!result) return NotFound();
        return NoContent();
    }

}