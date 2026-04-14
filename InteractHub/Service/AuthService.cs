using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using InteractHub.DTOs.Auth;
using InteractHub.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace InteractHub.Service;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _config;

    public AuthService(UserManager<ApplicationUser> userManager, IConfiguration config)
    {
        _userManager = userManager;
        _config = config;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto request)
    {
        // Kiểm tra email đã tồn tại chưa
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            throw new Exception("Email đã được sử dụng");

        // Tạo user mới
        var user = new ApplicationUser
        {
            UserName = request.UserName,
            Email = request.Email,
            DisplayName = request.DisplayName,
            Role = "User",
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception(errors);
        }

        // Gán role "User" cho tài khoản mới
        await _userManager.AddToRoleAsync(user, "User");

        // Trả về token ngay sau khi đăng ký
        return GenerateToken(user, "User");
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto request)
    {
        // Tìm user theo email
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            throw new Exception("Email hoặc mật khẩu không đúng");

        // Kiểm tra tài khoản có bị khóa không
        if (!user.IsActive)
            throw new Exception("Tài khoản đã bị khóa");

        // Kiểm tra mật khẩu
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
            throw new Exception("Email hoặc mật khẩu không đúng");

        // Lấy role của user
        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "User";

        return GenerateToken(user, role);
    }

    // Tạo JWT Token
    private AuthResponseDto GenerateToken(ApplicationUser user, string role)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiresAt = DateTime.UtcNow.AddMinutes(
            double.Parse(_config["Jwt:ExpiryMinutes"]!));

        // Claims là thông tin được mã hóa trong token
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName!),
            new Claim(ClaimTypes.Role, role)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return new AuthResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            UserId = user.Id.ToString(),
            UserName = user.UserName!,
            Email = user.Email!,
            DisplayName = user.DisplayName,
            Role = role,
            ExpiresAt = expiresAt
        };
    }
}