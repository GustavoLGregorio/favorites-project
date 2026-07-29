using Favorites.Domain.Common;

namespace Favorites.Domain.Aggregates.UserAggregate;

public class User : AggregateRoot<Guid>
{
    private readonly List<LinkedAccount> _linkedAccounts = [];

    public string GoogleId { get; private set; }
    public string Email { get; private set; }
    public string Name { get; private set; }
    public string? AvatarUrl { get; private set; }
    public DateTime CreatedAtUtc { get; private set; }
    public DateTime UpdatedAtUtc { get; private set; }

    public IReadOnlyCollection<LinkedAccount> LinkedAccounts => _linkedAccounts.AsReadOnly();

    private User(Guid id, string googleId, string email, string name, string? avatarUrl) : base(id)
    {
        GoogleId = googleId;
        Email = email;
        Name = name;
        AvatarUrl = avatarUrl;
        CreatedAtUtc = DateTime.UtcNow;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public static User CreateFromGoogle(string googleId, string email, string name, string? avatarUrl)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(googleId);
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        ArgumentException.ThrowIfNullOrWhiteSpace(name);

        var user = new User(Guid.NewGuid(), googleId, email, name, avatarUrl);
        return user;
    }

    public void UpdateProfile(string name, string? avatarUrl)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        Name = name;
        AvatarUrl = avatarUrl;
        UpdatedAtUtc = DateTime.UtcNow;
    }

    public LinkedAccount AddOrUpdateLinkedAccount(
        ServiceProvider provider,
        string? externalUserId,
        string? accessToken,
        string? refreshToken,
        DateTime? expiresAtUtc)
    {
        var existing = _linkedAccounts.FirstOrDefault(a => a.Provider == provider);
        if (existing is not null)
        {
            existing.UpdateTokens(accessToken, refreshToken, expiresAtUtc);
            UpdatedAtUtc = DateTime.UtcNow;
            return existing;
        }

        var account = LinkedAccount.Create(Id, provider, externalUserId, accessToken, refreshToken, expiresAtUtc);
        _linkedAccounts.Add(account);
        UpdatedAtUtc = DateTime.UtcNow;
        return account;
    }
}
