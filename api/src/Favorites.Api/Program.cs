using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Favorites.Api.Middleware;
using Favorites.Application.Auth.Commands;
using Favorites.Application.Common.Interfaces;
using Favorites.Domain.Aggregates.UserAggregate;
using Favorites.Domain.Repositories;
using Favorites.Infrastructure.Auth;
using Favorites.Infrastructure.ExternalServices;
using Favorites.Infrastructure.ExternalServices.AniList;
using Favorites.Infrastructure.Logging;
using Favorites.Infrastructure.Persistence;
using Favorites.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog Global Logger
SerilogConfiguration.ConfigureSerilog(builder);

// Configure Controllers with snake_case Naming Policy & Lowercase Provider Enum Serialization
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
        options.JsonSerializerOptions.Converters.Add(new ServiceProviderJsonConverter());
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.SnakeCaseLower));
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS for Local, Vercel & Staging Deployments
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration["ALLOWED_ORIGINS"]?
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        if (allowedOrigins is not null && allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            policy.SetIsOriginAllowed(_ => true)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});

// Configure JWT Authentication
var jwtSecret = builder.Configuration["JWT_SECRET_KEY"] 
    ?? builder.Configuration["Jwt:SecretKey"] 
    ?? "8249088b60d6bec2f354e9ae0c725ea66ca650b396a2f5015a0d41a8b0a4860d";
var jwtIssuer = builder.Configuration["JWT_ISSUER"] 
    ?? builder.Configuration["Jwt:Issuer"] 
    ?? "FavoritesApi";
var jwtAudience = builder.Configuration["JWT_AUDIENCE"] 
    ?? builder.Configuration["Jwt:Audience"] 
    ?? "FavoritesClient";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

// Register MediatR
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<AuthenticateWithGoogleCommand>());

// Register Application & Infrastructure Services
builder.Services.AddHttpClient<IGoogleAuthService, GoogleAuthService>();
builder.Services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddSingleton<DapperContext>();
builder.Services.AddTransient<DatabaseInitializer>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// Register External API Clients & Media Search Aggregator
builder.Services.AddHttpClient<AniListApiClient>();
builder.Services.AddTransient<IExternalMediaProvider, AniListApiClient>();
builder.Services.AddTransient<IMediaSearchAggregator, MediaSearchAggregator>();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

// Auto-initialize Database Schema (Tables & Indexes)
try
{
    using var scope = app.Services.CreateScope();
    var dbInitializer = scope.ServiceProvider.GetRequiredService<DatabaseInitializer>();
    await dbInitializer.InitializeAsync();
    Log.Information("Database schema initialized successfully.");
}
catch (Exception ex)
{
    Log.Error(ex, "An error occurred while initializing the database schema.");
}

// Enable Swagger in Development and Staging
if (app.Environment.IsDevelopment() || string.Equals(builder.Configuration["ENABLE_SWAGGER"], "true", StringComparison.OrdinalIgnoreCase))
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

Log.Information("Favorites Core API starting up...");
app.Run();
