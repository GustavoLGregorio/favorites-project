using Dapper;

namespace Favorites.Infrastructure.Persistence;

public class DatabaseInitializer
{
    private readonly DapperContext _context;

    public DatabaseInitializer(DapperContext context)
    {
        _context = context;
    }

    public async Task InitializeAsync()
    {
        using var connection = _context.CreateConnection();
        const string sql = """
            -- Users Table (Google OAuth Core Identity)
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                google_id VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                avatar_url TEXT,
                created_at_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp(),
                updated_at_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()
            );

            -- Linked External Service Accounts (MyAnimeList, AniList, Steam, Trakt, etc.)
            CREATE TABLE IF NOT EXISTS linked_accounts (
                id UUID PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                provider INT NOT NULL,
                external_user_id VARCHAR(255),
                access_token TEXT,
                refresh_token TEXT,
                expires_at_utc TIMESTAMP WITH TIME ZONE,
                created_at_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp(),
                updated_at_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp(),
                CONSTRAINT uq_user_provider UNIQUE (user_id, provider)
            );

            -- User Collections Table
            CREATE TABLE IF NOT EXISTS user_collections (
                id UUID PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(150) NOT NULL,
                description TEXT,
                is_public BOOLEAN NOT NULL DEFAULT true,
                created_at_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()
            );

            -- Collection Items Table (Referencing External Provider + External ID)
            CREATE TABLE IF NOT EXISTS collection_items (
                id UUID PRIMARY KEY,
                collection_id UUID NOT NULL REFERENCES user_collections(id) ON DELETE CASCADE,
                provider INT NOT NULL,
                external_id VARCHAR(255) NOT NULL,
                rating NUMERIC(3, 1) CHECK (rating >= 1.0 AND rating <= 10.0),
                status INT NOT NULL,
                notes TEXT,
                added_at_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp(),
                CONSTRAINT uq_collection_provider_external_id UNIQUE (collection_id, provider, external_id)
            );

            -- Indexes for Fast Lookups
            CREATE INDEX IF NOT EXISTS ix_linked_accounts_user_id ON linked_accounts (user_id);
            CREATE INDEX IF NOT EXISTS ix_user_collections_user_id ON user_collections (user_id);
            CREATE INDEX IF NOT EXISTS ix_collection_items_lookup ON collection_items (collection_id, provider, external_id);
            """;

        await connection.ExecuteAsync(sql);
    }
}
