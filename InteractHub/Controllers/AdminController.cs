using InteractHub.DTOs.Admin;
using InteractHub.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]          // chỉ tài khoản Role = "Admin" được truy cập
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    // ══════════════════════════════════════════════════════════════
    //  REPORT MANAGEMENT
    // ══════════════════════════════════════════════════════════════

    /// <summary>
    /// GET api/admin/reports?status=Pending
    /// Lấy danh sách báo cáo. status: Pending | Reviewed | Dismissed (tuỳ chọn)
    /// </summary>
    [HttpGet("reports")]
    public async Task<IActionResult> GetReports([FromQuery] string? status)
    {
        try
        {
            var reports = await _adminService.GetReportsAsync(status);
            return Ok(new { success = true, data = reports });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// GET api/admin/reports/{reportId}
    /// Xem chi tiết một báo cáo cụ thể (nội dung bài viết + thông tin người báo cáo).
    /// </summary>
    [HttpGet("reports/{reportId}")]
    public async Task<IActionResult> GetReportDetail(Guid reportId)
    {
        try
        {
            var detail = await _adminService.GetReportByIdAsync(reportId);
            return Ok(new { success = true, data = detail });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// PATCH api/admin/reports/{reportId}/resolve
    /// Xử lý báo cáo: đánh dấu Reviewed (giữ bài) hoặc Dismissed (bác bỏ).
    /// Body: { "status": "Reviewed" | "Dismissed", "adminNote": "..." }
    /// </summary>
    [HttpPatch("reports/{reportId}/resolve")]
    public async Task<IActionResult> ResolveReport(Guid reportId, [FromBody] ResolveReportDto dto)
    {
        try
        {
            await _adminService.ResolveReportAsync(reportId, dto);
            return Ok(new { success = true, message = "Đã xử lý báo cáo." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// DELETE api/admin/posts/{postId}
    /// Xoá bài viết vi phạm + tự động đánh dấu tất cả báo cáo liên quan là Reviewed.
    /// </summary>
    [HttpDelete("posts/{postId}")]
    public async Task<IActionResult> DeleteViolatingPost(Guid postId)
    {
        try
        {
            await _adminService.DeletePostAndResolveReportsAsync(postId);
            return Ok(new { success = true, message = "Đã xoá bài viết và xử lý các báo cáo liên quan." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  USER MANAGEMENT
    // ══════════════════════════════════════════════════════════════

    /// <summary>
    /// GET api/admin/users?isActive=true
    /// Lấy danh sách người dùng. isActive: true | false (tuỳ chọn)
    /// </summary>
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] bool? isActive)
    {
        try
        {
            var users = await _adminService.GetUsersAsync(isActive);
            return Ok(new { success = true, data = users });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// GET api/admin/users/{userId}
    /// Xem chi tiết một người dùng.
    /// </summary>
    [HttpGet("users/{userId}")]
    public async Task<IActionResult> GetUser(Guid userId)
    {
        try
        {
            var user = await _adminService.GetUserByIdAsync(userId);
            return Ok(new { success = true, data = user });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// PATCH api/admin/users/{userId}/active
    /// Khoá (isActive: false) hoặc mở khoá (isActive: true) tài khoản.
    /// Body: { "isActive": false }
    /// </summary>
    [HttpPatch("users/{userId}/active")]
    public async Task<IActionResult> SetUserActive(Guid userId, [FromBody] SetUserActiveDto dto)
    {
        try
        {
            await _adminService.SetUserActiveAsync(userId, dto);
            var msg = dto.IsActive ? "Đã mở khoá tài khoản." : "Đã khoá tài khoản.";
            return Ok(new { success = true, message = msg });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}