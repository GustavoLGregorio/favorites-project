using Favorites.Domain.Common;

namespace Favorites.Domain.Aggregates.UserAggregate;

public class LinkedAccount : Entity<Guid>
{
    public Guid UserId { get; private set; }
    public ServiceProvider Provider { get; private set; }
    public string? ExternalUserId { get; private set; }
    public string? AccessToken { get; private set; }
    public string? RefreshToken { get; private set; }
    public DateTime? ExpiresAtUtc { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime UpdatedAtUtc { get; private set; }

    private LinkedAccount(
        Guid id,
        Guid userId,
        ServiceProvider provider,
        string? externalUserId,
        string? accessToken,
        string? refreshToken,
        DateTime? expiresAtUtc) : base(id)
    {
        UserId = userId;
        Provider = provider;
        ExternalUserId = externalUserId;
        AccessToken = accessToken;
        RefreshToken = refreshToken;
        ExpiresAtUtc = expiresAtUtc;
        CreatedAtUtc = DateTime.UtcNow;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public static LinkedAccount Create(
        Guid userId,
        ServiceProvider provider,
        string? externalUserId,
        string? accessToken,
        string? refreshToken,
        DateTime? expiresAtUtc)
    {
        return new LinkedAccount(
            Guid.NewGuid(),
            userId,
            provider,
            externalUserId,
            accessToken,
            refreshToken,
            expiresAtUtc);
    }

    public void UpdateTokens(string? accessToken, string? refreshToken, DateTime? expiresAtUtc)
    {
        AccessToken = accessToken;
        RefreshToken = refreshToken;
        ExpiresAtUtc = expiresAtUtc;
        UpdatedAtUtc = DateTime.UtcNow;
    }
}
