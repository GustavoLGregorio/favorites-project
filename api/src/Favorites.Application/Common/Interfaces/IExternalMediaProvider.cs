using Favorites.Domain.Aggregates.UserAggregate;
using Favorites.Domain.Common;

namespace Favorites.Application.Common.Interfaces;

public interface IExternalMediaProvider
{
    ServiceProvider Provider { get; }
    Task<IReadOnlyList<MediaSearchResult>> SearchAsync(
        string query,
        string? mediaType = null,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);
}
