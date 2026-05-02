using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using InteractHub.Data;
using InteractHub.Model;
using InteractHub.DTOs.Admin;
using InteractHub.Service;

namespace InteractHub.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class PostReportsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly UserManager<ApplicationUser> _userManager;

    public PostReportsController(
        AppDbContext context,
        INotificationService notificationService,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _notificationService = notificationService;
        _userManager = userManager;
    }

    /// <summary>
    /// POST api/postreports
    /// User gửi báo cáo một bài viết.
    /// Body: { "postId": "...", "reason": "Spam|HateSpeech|Violence|Nudity|FakeNews|Other" }
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateReport([FromBody] CreatePostReportDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Kiểm tra bài viết tồn tại
        var post = await _context.Posts
            .Include(p => p.Author)
            .FirstOrDefaultAsync(p => p.Id == dto.PostId);
        if (post == null)
            return NotFound(new { message = "Bài viết không tồn tại." });

        // Không cho phép báo cáo bài của chính mình
        if (post.UserId == userId)
            return BadRequest(new { message = "Bạn không thể báo cáo bài viết của chính mình." });

        // Kiểm tra đã báo cáo bài này chưa
        var existed = _context.PostReports
            .Any(r => r.PostId == dto.PostId && r.ReporterId == userId);
        if (existed)
            return BadRequest(new { message = "Bạn đã báo cáo bài viết này rồi." });

        // Lưu report
        var report = new PostReport
        {
            PostId     = dto.PostId,
            ReporterId = userId,
            Reason     = dto.Reason,
            Status     = "Pending",
            CreatedAt  = DateTime.UtcNow,
        };
        _context.PostReports.Add(report);
        await _context.SaveChangesAsync();

        // Lấy tên người báo cáo
        var reporter = await _userManager.FindByIdAsync(userId.ToString());
        var reporterName = reporter?.DisplayName ?? "Người dùng";

        // Snippet nội dung bài viết
        var snippet = post.Content?.Length > 60
            ? post.Content.Substring(0, 60) + "…"
            : post.Content ?? "(không có nội dung)";

        var reasonLabel = dto.Reason switch
        {
            "Spam"       => "Spam",
            "HateSpeech" => "Ngôn từ thù ghét",
            "Violence"   => "Bạo lực",
            "Nudity"     => "Nội dung nhạy cảm",
            "FakeNews"   => "Tin giả",
            _            => "Khác",
        };

        // Gửi notification đến tất cả Admin
        var admins = await _userManager.GetUsersInRoleAsync("Admin");
        foreach (var admin in admins)
        {
            await _notificationService.CreateAndSendAsync(
                userId:      admin.Id,
                actorId:     userId,                // người báo cáo
                type:        "NewReport",
                message:     $"{reporterName} báo cáo bài viết [{reasonLabel}]: \"{snippet}\"",
                referenceId: dto.PostId             // ← Admin click vào sẽ đến được bài viết
            );
        }

        return Ok(new { success = true, message = "Đã gửi báo cáo." });
    }
}