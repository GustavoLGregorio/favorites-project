using Favorites.Application.Common.Interfaces;
using Favorites.Domain.Aggregates.UserAggregate;
using Favorites.Domain.Common;
using Microsoft.Extensions.Logging;

namespace Favorites.Infrastructure.ExternalServices;

public class MediaSearchAggregator : IMediaSearchAggregator
{
    private readonly IEnumerable<IExternalMediaProvider> _providers;
    private readonly ILogger<MediaSearchAggregator> _logger;

    public MediaSearchAggregator(
        IEnumerable<IExternalMediaProvider> providers,
        ILogger<MediaSearchAggregator> logger)
    {
        _providers = providers;
        _logger = logger;
    }

    public async Task<IReadOnlyList<MediaSearchResult>> SearchAsync(
        string query,
        string? mediaType = null,
        IReadOnlyList<ServiceProvider>? providers = null,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Array.Empty<MediaSearchResult>();
        }

        var activeProviders = _providers.Where(p =>
            providers is null || providers.Count == 0 || providers.Contains(p.Provider));

        var searchTasks = activeProviders.Select(async provider =>
        {
            try
            {
                return await provider.SearchAsync(query, mediaType, page, pageSize, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to execute search on provider '{Provider}'.", provider.Provider);
                return (IReadOnlyList<MediaSearchResult>)Array.Empty<MediaSearchResult>();
            }
        });

        var resultsPerProvider = await Task.WhenAll(searchTasks);
        var combinedResults = resultsPerProvider
            .SelectMany(r => r)
            .OrderByDescending(r => r.AverageScore ?? 0.0)
            .Take(pageSize * 2)
            .ToList();

        return combinedResults.AsReadOnly();
    }
}
