namespace Favorites.Application.Auth.DTOs;

public record UserProfileDto(
    Guid Id,
    string GoogleId,
    string Email,
    string Name,
    string? AvatarUrl,
    DateTime CreatedAtUtc);
