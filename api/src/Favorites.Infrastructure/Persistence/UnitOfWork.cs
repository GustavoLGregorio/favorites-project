using Favorites.Domain.Repositories;

namespace Favorites.Infrastructure.Persistence;

public class UnitOfWork : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // For Dapper explicit repository operations, queries are executed directly on DB connection
        return Task.FromResult(1);
    }
}
