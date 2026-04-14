using System.ComponentModel.DataAnnotations;

namespace InteractHub.DTOs.Auth;

public class RegisterDto
{
    [Required(ErrorMessage = "Username là bắt buộc")]
    [MaxLength(50)]
    public string UserName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
    [MinLength(6, ErrorMessage = "Mật khẩu tối thiểu 6 ký tự")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên hiển thị là bắt buộc")]
    [MaxLength(100)]
    public string DisplayName { get; set; } = string.Empty;
}