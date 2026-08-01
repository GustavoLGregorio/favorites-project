using Favorites.Domain.Aggregates.UserAggregate;

namespace Favorites.Domain.Common;

public record MediaSearchResult(
    string ExternalId,
    ServiceProvider Provider,
    string Title,
    string? NativeTitle,
    string? Description,
    string? CoverImageUrl,
    string? BannerImageUrl,
    string MediaType, // "anime", "manga", "movie", "series", "game", "book"
    int? ReleaseYear,
    double? AverageScore,
    IReadOnlyList<string> Genres,
    int? EpisodesOrChaptersCount
);
