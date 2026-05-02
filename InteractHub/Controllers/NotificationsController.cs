using System.Security.Claims;
using InteractHub.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InteractHub.DTOs;              
using InteractHub.Model;
using Microsoft.AspNetCore.Identity;

namespace InteractHub.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly UserManager<ApplicationUser> _userManager;

    public NotificationsController(INotificationService notificationService, UserManager<ApplicationUser> userManager)
    {
        _notificationService = notificationService;
        _userManager = userManager;
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/notifications
    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        try
        {   
            var result = await _notificationService.GetNotificationsAsync(GetUserId());
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // GET api/notifications/unread-count
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount()
    {
        try
        {
            var count = await _notificationService.GetUnreadCountAsync(GetUserId());
            return Ok(new { success = true, data = count });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // PUT api/notifications/{id}/read
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        try
        {
            await _notificationService.MarkAsReadAsync(id, GetUserId());
            return Ok(new { success = true, message = "Đã đánh dấu đã đọc" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // PUT api/notifications/read-all
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        try
        {
            await _notificationService.MarkAllAsReadAsync(GetUserId());
            return Ok(new { success = true, message = "Đã đánh dấu tất cả đã đọc" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPost("share")]
    public async Task<IActionResult> NotifyShare([FromBody] ShareNotificationDto dto)
    {
        try
        {
            var sharerId = GetUserId();

            // Không gửi thông báo nếu share bài của chính mình
            if (sharerId == dto.PostOwnerId)
                return Ok(new { success = true });

            // Lấy tên người share
            var sharer = await _userManager.FindByIdAsync(sharerId.ToString());

            await _notificationService.CreateAndSendAsync(
                userId: dto.PostOwnerId,
                actorId: sharerId,
                type: "Share",
                message: $"{sharer?.DisplayName} đã chia sẻ bài viết của bạn",
                referenceId: dto.PostId
            );

            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPost("test")]
    public async Task<IActionResult> TestNotification()
    {
        var userId = GetUserId();
        await _notificationService.CreateAndSendAsync(
            userId: userId,
            actorId: null,
            type: "Like",
            message: "Đây là thông báo test!",
            referenceId: null
        );
        return Ok(new { success = true, message = "Đã tạo thông báo!" });
    }
}