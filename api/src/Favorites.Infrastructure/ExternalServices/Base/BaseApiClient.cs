using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;

namespace Favorites.Infrastructure.ExternalServices.Base;

public abstract class BaseApiClient
{
    protected readonly HttpClient HttpClient;
    protected readonly ILogger Logger;
    protected static readonly JsonSerializerOptions DefaultJsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    protected BaseApiClient(HttpClient httpClient, ILogger logger)
    {
        HttpClient = httpClient;
        Logger = logger;
    }

    protected async Task<TResponse?> GetJsonAsync<TResponse>(
        string requestUri,
        IDictionary<string, string>? headers = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, requestUri);
            AddHeaders(request, headers);

            using var response = await HttpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<TResponse>(DefaultJsonOptions, cancellationToken);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "GET request to '{RequestUri}' failed.", requestUri);
            return default;
        }
    }

    protected async Task<TResponse?> PostJsonAsync<TRequest, TResponse>(
        string requestUri,
        TRequest body,
        IDictionary<string, string>? headers = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, requestUri)
            {
                Content = JsonContent.Create(body, options: DefaultJsonOptions)
            };
            AddHeaders(request, headers);

            using var response = await HttpClient.SendAsync(request, cancellationToken);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<TResponse>(DefaultJsonOptions, cancellationToken);
        }
        catch (Exception ex)
        {
            Logger.LogError(ex, "POST request to '{RequestUri}' failed.", requestUri);
            return default;
        }
    }

    private static void AddHeaders(HttpRequestMessage request, IDictionary<string, string>? headers)
    {
        if (headers is null) return;
        foreach (var (key, value) in headers)
        {
            request.Headers.TryAddWithoutValidation(key, value);
        }
    }
}
