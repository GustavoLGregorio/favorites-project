using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Favorites.Application.Common.Interfaces;
using Favorites.Domain.Aggregates.UserAggregate;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Favorites.Infrastructure.Auth;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _configuration;

    public JwtTokenGenerator(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string Token, DateTime ExpiresAtUtc) GenerateToken(User user)
    {
        var secretKey = _configuration["Jwt:SecretKey"] ?? "SUPER_SECRET_FALLBACK_KEY_AT_LEAST_32_BYTES_LONG_FAVORITES_API";
        var issuer = _configuration["Jwt:Issuer"] ?? "FavoritesApi";
        var audience = _configuration["Jwt:Audience"] ?? "FavoritesClient";
        var expirationMinutes = int.TryParse(_configuration["Jwt:ExpirationMinutes"], out var mins) ? mins : 1440;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Name, user.Name),
            new Claim("google_id", user.GoogleId),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAtUtc,
            signingCredentials: credentials);

        var token = new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        return (token, expiresAtUtc);
    }
}
