using Hurof.Api.DTOs.Auth;
using Hurof.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Hurof.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IJwtService jwtService, IConfiguration configuration) : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var hostPassword = configuration["Host:Password"];
        if (request.Password != hostPassword)
            return Unauthorized(new { message = "Invalid password." });

        var (token, expiresAt) = jwtService.GenerateToken();
        return Ok(new LoginResponse(token, expiresAt));
    }
}
