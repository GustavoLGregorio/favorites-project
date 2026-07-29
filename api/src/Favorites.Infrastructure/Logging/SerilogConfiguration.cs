using Microsoft.AspNetCore.Builder;
using Serilog;
using Serilog.Formatting.Compact;

namespace Favorites.Infrastructure.Logging;

public static class SerilogConfiguration
{
    public static void ConfigureSerilog(WebApplicationBuilder builder)
    {
        Log.Logger = new LoggerConfiguration()
            .ReadFrom.Configuration(builder.Configuration)
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .Enrich.WithEnvironmentName()
            .WriteTo.Console(new RenderedCompactJsonFormatter())
            .WriteTo.File(new CompactJsonFormatter(), "logs/favorites_api_.log", rollingInterval: RollingInterval.Day)
            .CreateLogger();

        builder.Host.UseSerilog();
    }
}
