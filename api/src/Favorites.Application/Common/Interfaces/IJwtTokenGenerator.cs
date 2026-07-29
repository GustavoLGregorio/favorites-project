using Favorites.Domain.Aggregates.UserAggregate;

namespace Favorites.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiresAtUtc) GenerateToken(User user);
}
