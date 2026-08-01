using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using Favorites.Application.Common.Interfaces;
using Favorites.Domain.Aggregates.UserAggregate;
using Favorites.Domain.Common;
using Favorites.Infrastructure.ExternalServices.Base;
using Microsoft.Extensions.Logging;

namespace Favorites.Infrastructure.ExternalServices.AniList;

public class AniListApiClient : BaseApiClient, IExternalMediaProvider
{
    private const string AniListGraphQLEndpoint = "https://graphql.anilist.co";

    public ServiceProvider Provider => ServiceProvider.AniList;

    public AniListApiClient(HttpClient httpClient, ILogger<AniListApiClient> logger)
        : base(httpClient, logger)
    {
    }

    public async Task<IReadOnlyList<MediaSearchResult>> SearchAsync(
        string query,
        string? mediaType = null,
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return Array.Empty<MediaSearchResult>();
        }

        string? aniListType = mediaType?.ToLowerInvariant() switch
        {
            "anime" => "ANIME",
            "manga" or "book" => "MANGA",
            _ => null
        };

        const string graphQLQuery = """
            query ($search: String, $type: MediaType, $page: Int, $perPage: Int) {
              Page(page: $page, perPage: $perPage) {
                media(search: $search, type: $type, sort: [POPULARITY_DESC, SCORE_DESC]) {
                  id
                  type
                  format
                  status
                  episodes
                  chapters
                  volumes
                  description
                  startDate {
                    year
                  }
                  averageScore
                  genres
                  title {
                    romaji
                    english
                    native
                  }
                  coverImage {
                    extraLarge
                    large
                    medium
                  }
                  bannerImage
                }
              }
            }
            """;

        var payload = new
        {
            query = graphQLQuery,
            variables = new
            {
                search = query,
                type = aniListType,
                page,
                perPage = pageSize
            }
        };

        var response = await PostJsonAsync<object, AniListGraphQLResponse>(
            AniListGraphQLEndpoint,
            payload,
            cancellationToken: cancellationToken);

        var mediaList = response?.Data?.Page?.Media;
        if (mediaList is null || mediaList.Count == 0)
        {
            return Array.Empty<MediaSearchResult>();
        }

        var results = new List<MediaSearchResult>();
        foreach (var item in mediaList)
        {
            var title = item.Title?.English ?? item.Title?.Romaji ?? item.Title?.Native ?? "Untitled";
            var rawDescription = item.Description ?? string.Empty;
            var cleanDescription = Regex.Replace(rawDescription, "<.*?>", string.Empty);

            var score = item.AverageScore.HasValue ? Math.Round(item.AverageScore.Value / 10.0, 1) : (double?)null;
            var coverUrl = item.CoverImage?.ExtraLarge ?? item.CoverImage?.Large ?? item.CoverImage?.Medium;
            var itemMediaType = item.Type?.ToLowerInvariant() ?? "anime";
            var episodesOrChapters = item.Episodes ?? item.Chapters;

            results.Add(new MediaSearchResult(
                ExternalId: item.Id.ToString(),
                Provider: ServiceProvider.AniList,
                Title: title,
                NativeTitle: item.Title?.Native,
                Description: cleanDescription,
                CoverImageUrl: coverUrl,
                BannerImageUrl: item.BannerImage,
                MediaType: itemMediaType,
                ReleaseYear: item.StartDate?.Year,
                AverageScore: score,
                Genres: item.Genres ?? new List<string>(),
                EpisodesOrChaptersCount: episodesOrChapters
            ));
        }

        return results.AsReadOnly();
    }

    #region GraphQL DTOs
    private class AniListGraphQLResponse
    {
        [JsonPropertyName("data")]
        public AniListDataContainer? Data { get; set; }
    }

    private class AniListDataContainer
    {
        [JsonPropertyName("Page")]
        public AniListPageContainer? Page { get; set; }
    }

    private class AniListPageContainer
    {
        [JsonPropertyName("media")]
        public List<AniListMediaItem>? Media { get; set; }
    }

    private class AniListMediaItem
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("type")]
        public string? Type { get; set; }

        [JsonPropertyName("format")]
        public string? Format { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }

        [JsonPropertyName("episodes")]
        public int? Episodes { get; set; }

        [JsonPropertyName("chapters")]
        public int? Chapters { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("startDate")]
        public AniListDate? StartDate { get; set; }

        [JsonPropertyName("averageScore")]
        public int? AverageScore { get; set; }

        [JsonPropertyName("genres")]
        public List<string>? Genres { get; set; }

        [JsonPropertyName("title")]
        public AniListTitle? Title { get; set; }

        [JsonPropertyName("coverImage")]
        public AniListCoverImage? CoverImage { get; set; }

        [JsonPropertyName("bannerImage")]
        public string? BannerImage { get; set; }
    }

    private class AniListTitle
    {
        [JsonPropertyName("romaji")]
        public string? Romaji { get; set; }

        [JsonPropertyName("english")]
        public string? English { get; set; }

        [JsonPropertyName("native")]
        public string? Native { get; set; }
    }

    private class AniListCoverImage
    {
        [JsonPropertyName("extraLarge")]
        public string? ExtraLarge { get; set; }

        [JsonPropertyName("large")]
        public string? Large { get; set; }

        [JsonPropertyName("medium")]
        public string? Medium { get; set; }
    }

    private class AniListDate
    {
        [JsonPropertyName("year")]
        public int? Year { get; set; }
    }
    #endregion
}
