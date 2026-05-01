// POST   /api/posts/{postId}/like    → Toggle like (like/unlike)
// GET    /api/posts/{postId}/likes   → Danh sách users đã like

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using InteractHub.Service;
using InteractHub.Data;
using InteractHub.Model;

namespace InteractHub.Controllers;
[Authorize]
[ApiController]
[Route("api/posts/{postId}")]
public class LikesController : ControllerBase{
    private readonly ILikeService _likeService;
    public LikesController(ILikeService likeService){
        _likeService = likeService;
    }

    [HttpPost("like")]
    public async Task<ActionResult<object>> ToggleLike(Guid postId){
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _likeService.ToggleLike(postId, userId);
        if( result == null){
            return NotFound(new {message = "Post not found"});
        }
        return Ok(result);

    }
    // GET /api/posts/{postId}/unlike
    [HttpGet("likes")]
    public async Task<ActionResult<object>> GetLikes(Guid postId){
        var result = await _likeService.GetLikes(postId);
        if( result == null){
            return (new {message = "Post not found"});
        }
        return Ok(result);
    }
}