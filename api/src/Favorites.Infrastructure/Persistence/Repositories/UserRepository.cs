using Dapper;
using Favorites.Domain.Aggregates.UserAggregate;
using Favorites.Domain.Repositories;

namespace Favorites.Infrastructure.Persistence.Repositories;

public class UserRepository : IUserRepository
{
    private readonly DapperContext _context;

    public UserRepository(DapperContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        using var connection = _context.CreateConnection();
        const string sql = """
            SELECT id, google_id as GoogleId, email, name, avatar_url as AvatarUrl, created_at_utc as CreatedAtUtc, updated_at_utc as UpdatedAtUtc
            FROM users
            WHERE id = @Id;
            """;
        return await connection.QuerySingleOrDefaultAsync<User>(new CommandDefinition(sql, new { Id = id }, cancellationToken: cancellationToken));
    }

    public async Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken cancellationToken = default)
    {
        using var connection = _context.CreateConnection();
        const string sql = """
            SELECT id, google_id as GoogleId, email, name, avatar_url as AvatarUrl, created_at_utc as CreatedAtUtc, updated_at_utc as UpdatedAtUtc
            FROM users
            WHERE google_id = @GoogleId;
            """;
        return await connection.QuerySingleOrDefaultAsync<User>(new CommandDefinition(sql, new { GoogleId = googleId }, cancellationToken: cancellationToken));
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        using var connection = _context.CreateConnection();
        const string sql = """
            SELECT id, google_id as GoogleId, email, name, avatar_url as AvatarUrl, created_at_utc as CreatedAtUtc, updated_at_utc as UpdatedAtUtc
            FROM users
            WHERE email = @Email;
            """;
        return await connection.QuerySingleOrDefaultAsync<User>(new CommandDefinition(sql, new { Email = email }, cancellationToken: cancellationToken));
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        using var connection = _context.CreateConnection();
        const string sql = """
            INSERT INTO users (id, google_id, email, name, avatar_url, created_at_utc, updated_at_utc)
            VALUES (@Id, @GoogleId, @Email, @Name, @AvatarUrl, @CreatedAtUtc, @UpdatedAtUtc);
            """;
        await connection.ExecuteAsync(new CommandDefinition(sql, new
        {
            user.Id,
            user.GoogleId,
            user.Email,
            user.Name,
            user.AvatarUrl,
            user.CreatedAtUtc,
            user.UpdatedAtUtc
        }, cancellationToken: cancellationToken));
    }

    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        using var connection = _context.CreateConnection();
        const string sql = """
            UPDATE users
            SET name = @Name,
                avatar_url = @AvatarUrl,
                updated_at_utc = @UpdatedAtUtc
            WHERE id = @Id;
            """;
        await connection.ExecuteAsync(new CommandDefinition(sql, new
        {
            user.Id,
            user.Name,
            user.AvatarUrl,
            user.UpdatedAtUtc
        }, cancellationToken: cancellationToken));
    }
}
