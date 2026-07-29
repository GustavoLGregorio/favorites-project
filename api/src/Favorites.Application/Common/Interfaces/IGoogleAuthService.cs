namespace Favorites.Application.Common.Interfaces;

public record GoogleUserInfo(
    string GoogleId,
    string Email,
    string Name,
    string? AvatarUrl,
    bool EmailVerified);

public interface IGoogleAuthService
{
    Task<GoogleUserInfo?> ValidateIdTokenAsync(string idToken, CancellationToken cancellationToken = default);
}
