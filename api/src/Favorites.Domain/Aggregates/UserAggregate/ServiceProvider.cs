using System.Text.Json;
using System.Text.Json.Serialization;

namespace Favorites.Domain.Aggregates.UserAggregate;

[JsonConverter(typeof(ServiceProviderJsonConverter))]
public enum ServiceProvider
{
    MyAnimeList = 0,
    AniList = 1,
    Steam = 2,
    Trakt = 3,
    Spotify = 4,
    Goodreads = 5,
    TMDB = 6,
    IGDB = 7,
    OpenLibrary = 8
}

public class ServiceProviderJsonConverter : JsonConverter<ServiceProvider>
{
    public override ServiceProvider Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString()?.ToLowerInvariant();
        return value switch
        {
            "myanimelist" or "my_anime_list" => ServiceProvider.MyAnimeList,
            "anilist" or "ani_list" => ServiceProvider.AniList,
            "steam" => ServiceProvider.Steam,
            "trakt" => ServiceProvider.Trakt,
            "spotify" => ServiceProvider.Spotify,
            "goodreads" => ServiceProvider.Goodreads,
            "tmdb" => ServiceProvider.TMDB,
            "igdb" => ServiceProvider.IGDB,
            "openlibrary" or "open_library" => ServiceProvider.OpenLibrary,
            _ => throw new JsonException($"Unknown ServiceProvider '{value}'")
        };
    }

    public override void Write(Utf8JsonWriter writer, ServiceProvider value, JsonSerializerOptions options)
    {
        var stringValue = value switch
        {
            ServiceProvider.MyAnimeList => "myanimelist",
            ServiceProvider.AniList => "anilist",
            ServiceProvider.Steam => "steam",
            ServiceProvider.Trakt => "trakt",
            ServiceProvider.Spotify => "spotify",
            ServiceProvider.Goodreads => "goodreads",
            ServiceProvider.TMDB => "tmdb",
            ServiceProvider.IGDB => "igdb",
            ServiceProvider.OpenLibrary => "openlibrary",
            _ => value.ToString().ToLowerInvariant()
        };
        writer.WriteStringValue(stringValue);
    }
}
