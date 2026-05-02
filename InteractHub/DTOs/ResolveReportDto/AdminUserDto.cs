namespace InteractHub.DTOs.Admin;

// Danh sách người dùng cho Admin
public class AdminUserDto
{
    public Guid     Id          { get; set; }
    public string   UserName    { get; set; } = string.Empty;
    public string   DisplayName { get; set; } = string.Empty;
    public string   Email       { get; set; } = string.Empty;
    public string?  AvatarUrl   { get; set; }
    public string   Role        { get; set; } = "User";
    public bool     IsActive    { get; set; }
    public DateTime CreatedAt   { get; set; }
    public int      PostsCount  { get; set; }
    public int      ReportsCount { get; set; }  // số lần bị báo cáo
}

// Admin khoá / mở khoá tài khoản
public class SetUserActiveDto
{
    public bool IsActive { get; set; }
}