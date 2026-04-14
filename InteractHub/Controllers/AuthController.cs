using InteractHub.DTOs.Auth;
using InteractHub.Service;
using Microsoft.AspNetCore.Mvc;

namespace InteractHub.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // POST api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    // POST api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _authService.LoginAsync(request);
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return Unauthorized(new { success = false, message = ex.Message });
        }
    }
}