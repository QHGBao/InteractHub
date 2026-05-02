namespace InteractHub.DTOs.Admin;

// Trả về danh sách báo cáo (list view)
public class PostReportDto
{
    public Guid   Id           { get; set; }
    public Guid   PostId       { get; set; }
    public string PostContent  { get; set; } = string.Empty;
    public Guid   ReporterId   { get; set; }
    public string ReporterName { get; set; } = string.Empty;
    public string Reason       { get; set; } = string.Empty;
    public string Status       { get; set; } = "Pending";
    public string? AdminNote   { get; set; }
    public DateTime CreatedAt  { get; set; }
}

// Chi tiết một báo cáo (detail view)
public class PostReportDetailDto : PostReportDto
{
    public string PostAuthorName { get; set; } = string.Empty;
    public Guid   PostAuthorId   { get; set; }
    public string? PostImageUrl  { get; set; }
}

// Admin xử lý báo cáo: Reviewed (giữ) hoặc Dismissed (bác bỏ)
public class ResolveReportDto
{
    public string Status     { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
}

// ← THÊM MỚI: User gửi báo cáo bài viết
public class CreatePostReportDto
{
    public Guid   PostId { get; set; }
    public string Reason { get; set; } = string.Empty;
}