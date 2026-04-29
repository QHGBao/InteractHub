using System.Security.Claims;
using InteractHub.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace InteractHub.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
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