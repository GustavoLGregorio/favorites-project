namespace Favorites.Application.Auth.DTOs;

public record AuthResponseDto(
    string Token,
    DateTime ExpiresAtUtc,
    UserProfileDto User);
