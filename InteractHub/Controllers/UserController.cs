using InteractHub.DTOs.User;
using InteractHub.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InteractHub.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IFriendService _friendService;

    public UserController(IUserService userService, IFriendService friendService)
    {
        _userService   = userService;
        _friendService = friendService;
    }

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/user/{userId}
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetProfile(Guid userId)
    {
        try
        {
            var profile      = await _userService.GetProfileAsync(userId);
            var currentUserId = GetCurrentUserId();

            // Kiểm tra trạng thái bạn bè với người đang xem
            var friends      = await _friendService.GetFriendsAsync(currentUserId);
            var isFriend     = friends.Any(f => f.UserId == userId);

            var requests     = await _friendService.GetFriendRequestsAsync(currentUserId);
            var hasPending   = requests.Any(f => f.UserId == userId);

            return Ok(new
            {
                success = true,
                data = new
                {
                    profile,
                    friendStatus = isFriend    ? "Friend"  :
                                   hasPending  ? "Pending" : "None"
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // GET api/user/me
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        try
        {
            var profile = await _userService.GetProfileAsync(GetCurrentUserId());
            return Ok(new { success = true, data = profile });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // PUT api/user/me
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        try
        {
            await _userService.UpdateProfileAsync(GetCurrentUserId(), dto);
            return Ok(new { success = true, message = "Cập nhật thành công." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}