using InteractHub.DTOs.Admin;

namespace InteractHub.Service;

public interface IAdminService
{
    // ── Report management ──────────────────────────────────────────

    /// <summary>Lấy danh sách tất cả báo cáo, có thể lọc theo status.</summary>
    Task<IEnumerable<PostReportDto>> GetReportsAsync(string? status = null);

    /// <summary>Lấy chi tiết một báo cáo cụ thể.</summary>
    Task<PostReportDetailDto> GetReportByIdAsync(Guid reportId);

    /// <summary>
    /// Xử lý báo cáo:
    ///   - Status = "Reviewed"  → đánh dấu đã xem xét, giữ nguyên bài viết.
    ///   - Status = "Dismissed" → bác bỏ báo cáo.
    /// </summary>
    Task ResolveReportAsync(Guid reportId, ResolveReportDto dto);

    /// <summary>Xoá bài viết vi phạm và đánh dấu toàn bộ báo cáo liên quan là Reviewed.</summary>
    Task DeletePostAndResolveReportsAsync(Guid postId);

    // ── User management ────────────────────────────────────────────

    /// <summary>Lấy danh sách người dùng, có thể lọc theo isActive.</summary>
    Task<IEnumerable<AdminUserDto>> GetUsersAsync(bool? isActive = null);

    /// <summary>Lấy chi tiết một người dùng theo Id.</summary>
    Task<AdminUserDto> GetUserByIdAsync(Guid userId);

    /// <summary>Khoá hoặc mở khoá tài khoản người dùng.</summary>
    Task SetUserActiveAsync(Guid userId, SetUserActiveDto dto);
}