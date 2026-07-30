using System.Data;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Favorites.Infrastructure.Persistence;

public class DapperContext
{
    private readonly string _connectionString;

    public DapperContext(IConfiguration configuration)
    {
        var rawConn = configuration["DB_CONNECTION_STRING"]
            ?? configuration.GetConnectionString("DefaultConnection") 
            ?? "Host=localhost;Database=favorites;Username=postgres;Password=postgres";

        _connectionString = ConvertToNpgsqlConnectionString(rawConn);
    }

    public IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);

    private static string ConvertToNpgsqlConnectionString(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        // If connection string is in URI format (postgresql:// or postgres://), parse it into Npgsql format
        if (input.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            input.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var uri = new Uri(input);
                var userInfo = uri.UserInfo.Split(':', 2);
                var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
                var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
                var database = uri.AbsolutePath.TrimStart('/');
                var host = uri.Host;
                var port = uri.Port > 0 ? uri.Port : 5432;

                var builder = new NpgsqlConnectionStringBuilder
                {
                    Host = host,
                    Port = port,
                    Username = username,
                    Password = password,
                    Database = database,
                    SslMode = SslMode.Require
                };

                return builder.ConnectionString;
            }
            catch
            {
                return input;
            }
        }

        return input;
    }
}
