using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace Favorites.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/problem+json";

        var (statusCode, title) = exception switch
        {
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Unauthorized access"),
            ArgumentException => (HttpStatusCode.BadRequest, "Invalid argument"),
            KeyNotFoundException => (HttpStatusCode.NotFound, "Resource not found"),
            _ => (HttpStatusCode.InternalServerError, "An unexpected error occurred")
        };

        context.Response.StatusCode = (int)statusCode;

        var problemDetails = new ProblemDetails
        {
            Status = (int)statusCode,
            Title = title,
            Detail = exception.Message,
            Instance = context.Request.Path
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails));
    }
}
