using System.Text;
using Favorites.Api.Middleware;
using Favorites.Application.Auth.Commands;
using Favorites.Application.Common.Interfaces;
using Favorites.Domain.Repositories;
using Favorites.Infrastructure.Auth;
using Favorites.Infrastructure.Logging;
using Favorites.Infrastructure.Persistence;
using Favorites.Infrastructure.Persistence.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog Global Logger
SerilogConfiguration.ConfigureSerilog(builder);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:SecretKey"] ?? "SUPER_SECRET_FALLBACK_KEY_AT_LEAST_32_BYTES_LONG_FAVORITES_API";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "FavoritesApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "FavoritesClient";

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
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
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
