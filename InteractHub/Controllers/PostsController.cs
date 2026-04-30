// GET    /api/posts          → Lấy danh sách posts (có pagination)
// GET    /api/posts/{id}     → Chi tiết 1 post
// POST   /api/posts          → Tạo post mới
// PUT    /api/posts/{id}     → Sửa post
// DELETE /api/posts/{id}     → Xóa post

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using InteractHub.Service;
using InteractHub.DTOs.Post;

namespace InteractHub.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;

    public PostsController(IPostService postService)
    {
        _postService = postService;
    }

    // GET /api/posts
    [HttpGet]
    public async Task<ActionResult<object>> GetPosts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _postService.GetPosts(page, pageSize);
        if (result == null) return NotFound(new { message = "Page Not Found" });
        return Ok(result);
    }

    // GET /api/posts/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetPost(Guid id)
    {
        var result = await _postService.GetPost(id);
        return Ok(result);
    }

    // GET /api/posts/user/{userId}
    [HttpGet("by-user/{userId}")]
    public async Task<ActionResult<object>> GetPostsByUser(
    Guid userId,
    [FromQuery] int page = 1,
    [FromQuery] int pageSize = 10)
    {
        var result = await _postService.GetPostsByUser(userId, page, pageSize);
        return Ok(result);
    }

    // POST /api/posts
    [HttpPost]
    public async Task<ActionResult> CreatePost([FromBody] CreatePostDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _postService.CreatePost(userId, dto);
        return CreatedAtAction(nameof(GetPost), new { id = ((dynamic)result).id }, result);
    }

    // PUT /api/posts/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePost(Guid postId, [FromBody] UpdatePostDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _postService.UpdatePost(userId, postId, dto);
        if (!result) return NotFound();
        return NoContent();
    }

    // DELETE /api/posts/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(Guid postId)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _postService.DeletePost(userId, postId);
        if (!result) return NotFound();
        return NoContent();
    }
}