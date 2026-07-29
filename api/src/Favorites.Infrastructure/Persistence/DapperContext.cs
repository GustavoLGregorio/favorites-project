using System.Data;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Favorites.Infrastructure.Persistence;

public class DapperContext
{
    private readonly string _connectionString;

    public DapperContext(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Host=localhost;Database=favorites;Username=postgres;Password=postgres";
    }

    public IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);
}
