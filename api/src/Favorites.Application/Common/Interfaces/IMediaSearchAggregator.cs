using Favorites.Domain.Aggregates.UserAggregate;
using Favorites.Domain.Common;

namespace Favorites.Application.Common.Interfaces;

public interface IMediaSearchAggregator
{
    Task<IReadOnlyList<MediaSearchResult>> SearchAsync(
        string query,
        string? mediaType = null,
        IReadOnlyList<ServiceProvider>? providers = null,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);
}
