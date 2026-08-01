using Favorites.Application.Common.Interfaces;
using Favorites.Domain.Aggregates.UserAggregate;
using Favorites.Domain.Common;
using MediatR;

namespace Favorites.Application.Media.Queries.SearchMedia;

public record SearchMediaQuery(
    string Query,
    string? MediaType = null,
    IReadOnlyList<ServiceProvider>? Providers = null,
    int Page = 1,
    int PageSize = 10
) : IRequest<IReadOnlyList<MediaSearchResult>>;

public class SearchMediaQueryHandler : IRequestHandler<SearchMediaQuery, IReadOnlyList<MediaSearchResult>>
{
    private readonly IMediaSearchAggregator _searchAggregator;

    public SearchMediaQueryHandler(IMediaSearchAggregator searchAggregator)
    {
        _searchAggregator = searchAggregator;
    }

    public async Task<IReadOnlyList<MediaSearchResult>> Handle(SearchMediaQuery request, CancellationToken cancellationToken)
    {
        return await _searchAggregator.SearchAsync(
            request.Query,
            request.MediaType,
            request.Providers,
            request.Page,
            request.PageSize,
            cancellationToken);
    }
}
