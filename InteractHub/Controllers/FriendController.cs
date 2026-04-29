using InteractHub.DTOs.Friend;
using InteractHub.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InteractHub.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]  // Phải đăng nhập mới dùng được
public class FriendController : ControllerBase
{
    private readonly IFriendService _friendService;

    public FriendController(IFriendService friendService)
    {
        _friendService = friendService;
    }

    // Lấy userId từ JWT token
    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/friend/list
    [HttpGet("list")]
    public async Task<IActionResult> GetFriends()
    {
        var result = await _friendService.GetFriendsAsync(GetCurrentUserId());
        return Ok(new { success = true, data = result });
    }

    // GET api/friend/requests
    [HttpGet("requests")]
    public async Task<IActionResult> GetRequests()
    {
        var result = await _friendService.GetFriendRequestsAsync(GetCurrentUserId());
        return Ok(new { success = true, data = result });
    }

    // GET api/friend/suggestions
    [HttpGet("suggestions")]
    public async Task<IActionResult> GetSuggestions()
    {
        var result = await _friendService.GetSuggestionsAsync(GetCurrentUserId());
        return Ok(new { success = true, data = result });
    }

    // POST api/friend/request
    [HttpPost("request")]
    public async Task<IActionResult> SendRequest([FromBody] FriendRequestDto dto)
    {
        try
        {
            await _friendService.SendFriendRequestAsync(GetCurrentUserId(), dto.AddresseeId);
            return Ok(new { success = true, message = "Đã gửi lời mời kết bạn." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // PUT api/friend/accept/{friendshipId}
    [HttpPut("accept/{friendshipId}")]
    public async Task<IActionResult> Accept(Guid friendshipId)
    {
        try
        {
            await _friendService.AcceptFriendRequestAsync(GetCurrentUserId(), friendshipId);
            return Ok(new { success = true, message = "Đã chấp nhận lời mời." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // DELETE api/friend/reject/{friendshipId}
    [HttpDelete("reject/{friendshipId}")]
    public async Task<IActionResult> Reject(Guid friendshipId)
    {
        try
        {
            await _friendService.RejectFriendRequestAsync(GetCurrentUserId(), friendshipId);
            return Ok(new { success = true, message = "Đã từ chối lời mời." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // DELETE api/friend/unfriend/{friendId}
    [HttpDelete("unfriend/{friendId}")]
    public async Task<IActionResult> Unfriend(Guid friendId)
    {
        try
        {
            await _friendService.UnfriendAsync(GetCurrentUserId(), friendId);
            return Ok(new { success = true, message = "Đã hủy kết bạn." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}