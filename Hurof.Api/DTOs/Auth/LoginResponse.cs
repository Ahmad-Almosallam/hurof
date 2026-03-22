namespace Hurof.Api.DTOs.Auth;

public record LoginResponse(string Token, DateTime ExpiresAt);
