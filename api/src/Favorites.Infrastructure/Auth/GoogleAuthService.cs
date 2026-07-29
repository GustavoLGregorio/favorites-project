using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Favorites.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Favorites.Infrastructure.Auth;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<GoogleAuthService> _logger;

    public GoogleAuthService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<GoogleAuthService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<GoogleUserInfo?> ValidateIdTokenAsync(string idToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(idToken))
        {
            _logger.LogWarning("ValidateIdTokenAsync called with null or empty token.");
            return null;
        }

        // Mock token handler for local development/testing without live Google credentials
        if (idToken.StartsWith("mock_google_id_token_", StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("Processing mock Google ID token for local testing.");
            return new GoogleUserInfo(
                GoogleId: "mock_google_id_12345",
                Email: "mock.user@example.com",
                Name: "Mock User",
                AvatarUrl: "https://lh3.googleusercontent.com/a/default-user",
                EmailVerified: true);
        }

        try
        {
            var response = await _httpClient.GetFromJsonAsync<GoogleTokenInfoResponse>(
                $"https://oauth2.googleapis.com/tokeninfo?id_token={idToken}",
                cancellationToken);

            if (response is null || string.IsNullOrWhiteSpace(response.Sub))
            {
                _logger.LogWarning("Google tokeninfo API returned null or missing 'sub' claim.");
                return null;
            }

            var expectedClientId = _configuration["GOOGLE_CLIENT_ID"] 
                ?? _configuration["Authentication:Google:ClientId"];

            if (!string.IsNullOrWhiteSpace(expectedClientId) &&
                !expectedClientId.Contains("YOUR_GOOGLE_CLIENT_ID", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(response.Audience, expectedClientId, StringComparison.Ordinal))
            {
                _logger.LogWarning(
                    "Google token audience mismatch. Expected: {Expected}, Got: {Audience}",
                    expectedClientId,
                    response.Audience);
                return null;
            }

            return new GoogleUserInfo(
                GoogleId: response.Sub,
                Email: response.Email ?? string.Empty,
                Name: response.Name ?? response.Email ?? "Google User",
                AvatarUrl: response.Picture,
                EmailVerified: string.Equals(response.EmailVerified, "true", StringComparison.OrdinalIgnoreCase));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to validate Google ID Token against tokeninfo endpoint.");
            return null;
        }
    }

    private class GoogleTokenInfoResponse
    {
        [JsonPropertyName("sub")]
        public string? Sub { get; set; }

        [JsonPropertyName("email")]
        public string? Email { get; set; }

        [JsonPropertyName("email_verified")]
        public string? EmailVerified { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("picture")]
        public string? Picture { get; set; }

        [JsonPropertyName("aud")]
        public string? Audience { get; set; }
    }
}
