using InteractHub.Data;
using InteractHub.DTOs.Admin;
using InteractHub.Model;
using Microsoft.EntityFrameworkCore;

namespace InteractHub.Service;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;
    private readonly INotificationService _notificationService;

    public AdminService(AppDbContext db, INotificationService notificationService)
    {
        _db = db;
        _notificationService = notificationService;
    }

    // ── Report management ──────────────────────────────────────────

    public async Task<IEnumerable<PostReportDto>> GetReportsAsync(string? status = null)
    {
        var query = _db.PostReports
            .Include(r => r.Reporter)
            .Include(r => r.Post)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(r => r.Status == status);

        return await query
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new PostReportDto
            {
                Id           = r.Id,
                PostId       = r.PostId,
                PostContent  = r.Post.Content.Length > 200
                                   ? r.Post.Content.Substring(0, 200) + "…"
                                   : r.Post.Content,
                ReporterId   = r.ReporterId,
                ReporterName = r.Reporter.DisplayName,
                Reason       = r.Reason,
                Status       = r.Status,
                AdminNote    = r.AdminNote,
                CreatedAt    = r.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<PostReportDetailDto> GetReportByIdAsync(Guid reportId)
    {
        var r = await _db.PostReports
            .Include(r => r.Reporter)
            .Include(r => r.Post)
                .ThenInclude(p => p.Author)
            .FirstOrDefaultAsync(r => r.Id == reportId)
            ?? throw new Exception("Không tìm thấy báo cáo.");

        return new PostReportDetailDto
        {
            Id             = r.Id,
            PostId         = r.PostId,
            PostContent    = r.Post.Content,
            PostImageUrl   = r.Post.ImageUrl,
            PostAuthorId   = r.Post.UserId,
            PostAuthorName = r.Post.Author.DisplayName,
            ReporterId     = r.ReporterId,
            ReporterName   = r.Reporter.DisplayName,
            Reason         = r.Reason,
            Status         = r.Status,
            AdminNote      = r.AdminNote,
            CreatedAt      = r.CreatedAt
        };
    }

    public async Task ResolveReportAsync(Guid reportId, ResolveReportDto dto)
    {
        var allowed = new[] { "Reviewed", "Dismissed" };
        if (!allowed.Contains(dto.Status))
            throw new Exception("Status không hợp lệ. Chỉ chấp nhận: Reviewed, Dismissed.");

        var report = await _db.PostReports.FindAsync(reportId)
            ?? throw new Exception("Không tìm thấy báo cáo.");

        report.Status    = dto.Status;
        report.AdminNote = dto.AdminNote;

        await _db.SaveChangesAsync();
    }

    public async Task DeletePostAndResolveReportsAsync(Guid postId)
    {
        // Load post kèm Author để lấy UserId và snippet nội dung
        var post = await _db.Posts
            .Include(p => p.Author)
            .FirstOrDefaultAsync(p => p.Id == postId)
            ?? throw new Exception("Không tìm thấy bài viết.");

        var postOwnerId = post.UserId;

        // Lấy lý do báo cáo phổ biến nhất để ghi vào thông báo
        var topReason = await _db.PostReports
            .Where(r => r.PostId == postId)
            .GroupBy(r => r.Reason)
            .OrderByDescending(g => g.Count())
            .Select(g => g.Key)
            .FirstOrDefaultAsync();

        // Đánh dấu tất cả báo cáo liên quan là Reviewed
        var reports = await _db.PostReports
            .Where(r => r.PostId == postId)
            .ToListAsync();

        foreach (var r in reports)
        {
            r.Status    = "Reviewed";
            r.AdminNote = "Bài viết đã bị xoá bởi Admin.";
        }

        // Snippet nội dung bài viết (tối đa 60 ký tự)
        var snippet = post.Content?.Length > 60
            ? post.Content.Substring(0, 60) + "…"
            : post.Content ?? "(không có nội dung)";

        // Xoá bài viết
        _db.Posts.Remove(post);
        await _db.SaveChangesAsync();

        // Gửi thông báo cho chủ bài SAU KHI đã xóa xong
        var reasonLabel = topReason switch
        {
            "Spam"        => "spam",
            "HateSpeech"  => "ngôn từ thù ghét",
            "Violence"    => "bạo lực",
            "Nudity"      => "nội dung nhạy cảm",
            "FakeNews"    => "tin giả",
            _             => "vi phạm tiêu chuẩn cộng đồng"
        };

        await _notificationService.CreateAndSendAsync(
            userId:      postOwnerId,
            actorId:     null,                  // hệ thống gửi, không có actor
            type:        "PostRemoved",
            message:     $"Bài viết của bạn đã bị xoá do {reasonLabel}: \"{snippet}\"",
            referenceId: null                   // bài đã xóa nên không link được
        );
    }

    // ── User management ────────────────────────────────────────────

    public async Task<IEnumerable<AdminUserDto>> GetUsersAsync(bool? isActive = null)
    {
        var query = _db.Users.AsQueryable();

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        return await query
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserDto
            {
                Id           = u.Id,
                UserName     = u.UserName ?? string.Empty,
                DisplayName  = u.DisplayName,
                Email        = u.Email ?? string.Empty,
                AvatarUrl    = u.AvatarUrl,
                Role         = u.Role,
                IsActive     = u.IsActive,
                CreatedAt    = u.CreatedAt,
                PostsCount   = u.Posts.Count,
                ReportsCount = _db.PostReports.Count(r => r.Post.UserId == u.Id)
            })
            .ToListAsync();
    }

    public async Task<AdminUserDto> GetUserByIdAsync(Guid userId)
    {
        var u = await _db.Users
            .Include(u => u.Posts)
            .FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new Exception("Không tìm thấy người dùng.");

        var reportsCount = await _db.PostReports
            .CountAsync(r => r.Post.UserId == userId);

        return new AdminUserDto
        {
            Id           = u.Id,
            UserName     = u.UserName ?? string.Empty,
            DisplayName  = u.DisplayName,
            Email        = u.Email ?? string.Empty,
            AvatarUrl    = u.AvatarUrl,
            Role         = u.Role,
            IsActive     = u.IsActive,
            CreatedAt    = u.CreatedAt,
            PostsCount   = u.Posts.Count,
            ReportsCount = reportsCount
        };
    }

    public async Task SetUserActiveAsync(Guid userId, SetUserActiveDto dto)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new Exception("Không tìm thấy người dùng.");

        user.IsActive = dto.IsActive;
        await _db.SaveChangesAsync();
    }
}