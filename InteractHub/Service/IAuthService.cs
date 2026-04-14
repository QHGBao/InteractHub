using InteractHub.DTOs.Auth;

namespace InteractHub.Service;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(RegisterDto request);
    Task<AuthResponseDto> LoginAsync(LoginDto request);
}