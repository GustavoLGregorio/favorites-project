# Favorites Platform - Database & Data Access Specification

This document details the database architecture, PostgreSQL 18 relational schema, Dapper micro-ORM data access patterns, and implementation roadmap for the Favorites platform.

## Documentation Navigation Matrix

| Specification | Description | Document Link |
| :--- | :--- | :--- |
| **Global Baseline** | System architecture, monorepo setup, Docker environment, and core engineering standards. | **[globals.md](./globals.md)** |
| **Frontend Architecture** | Next.js 16 (App Router), React 19, TypeScript 7.0 (ESNext), Bun runtime, TanStack Query v5, Axios. | **[frontend.md](./frontend.md)** |
| **Core API Architecture** | C# 14, ASP.NET Core .NET 10 API, Rigid DDD, Dapper, Serilog Global Logger, OOP Patterns. | **[api.md](./api.md)** |
| **Database Architecture** | PostgreSQL 18 (Neon DB), Lightweight schema, Dapper mapping, Unit of Work. | **[database.md](./database.md)** (Current Document) |
| **Workers & Edge Layer** | Cloudflare Workers API Proxy, Cloudflare KV read-caching, External Service Sync & Miniflare emulation. | **[workers.md](./workers.md)** |

---

## 1. Engine & Environment

- **Database Engine**: **PostgreSQL 18** hosted on Neon Serverless PostgreSQL.
- **Micro-ORM**: Dapper 2.x (`Dapper`, `Dapper.SqlBuilder`, `Npgsql`).
- **Connection Provider**: `NpgsqlDataSource` with built-in connection pooling optimized for Neon serverless architecture.
- **Migration Tool**: DbUp or FluentMigrator (.NET console migration tool executed on deployment pipeline).

---

## 2. Schema Architecture (User-Centric & Light-Footprint)

The database **does not store media item metadata**. Media metadata is dynamically queried from third-party APIs via Cloudflare Workers edge proxies. PostgreSQL exclusively handles user accounts, Google OAuth identity, linked third-party service tokens, and user-curated collection references.

```sql
-- Users Table (Google OAuth Core Identity)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp(),
    updated_at_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()
);

-- Linked External Service Accounts (MyAnimeList, AniList, Steam, Trakt)
CREATE TABLE linked_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider INT NOT NULL, -- Enum: 0=MyAnimeList, 1=AniList, 2=Steam, 3=Trakt, 4=Spotify, 5=Goodreads
    external_user_id VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    expires_at_utc TIMESTAMP WITH TIME ZONE,
    created_at_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp(),
    updated_at_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_user_provider UNIQUE (user_id, provider)
);

-- User Collections Table
CREATE TABLE user_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp()
);

-- Collection Items Table (Referencing External Provider + External ID)
CREATE TABLE collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES user_collections(id) ON DELETE CASCADE,
    provider INT NOT NULL, -- Enum: 0=TMDB, 1=MyAnimeList, 2=AniList, 3=IGDB, 4=OpenLibrary, 5=Spotify
    external_id VARCHAR(255) NOT NULL,
    rating NUMERIC(3, 1) CHECK (rating >= 1.0 AND rating <= 10.0),
    status INT NOT NULL, -- Enum: 0=Watching, 1=Reading, 2=Playing, 3=Completed, 4=Dropped, 5=PlanToConsume
    notes TEXT,
    added_at_utc TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_collection_provider_external_id UNIQUE (collection_id, provider, external_id)
);

-- Indexes for Fast Collection Lookups and Token Queries
CREATE INDEX ix_linked_accounts_user_id ON linked_accounts (user_id);
CREATE INDEX ix_user_collections_user_id ON user_collections (user_id);
CREATE INDEX ix_collection_items_lookup ON collection_items (collection_id, provider, external_id);
```

---

## 3. Dapper Mapping & Access Patterns

### 3.1 Dapper Repositories for Users & Collections

All SQL queries are explicitly written inside Dapper Repository implementations.

```csharp
public interface IUserRepository
{
    Task<User?> GetByGoogleIdAsync(string googleId, CancellationToken ct = default);
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(User user, IDbTransaction transaction, CancellationToken ct = default);
    Task AddOrUpdateLinkedAccountAsync(Guid userId, LinkedAccount account, IDbTransaction transaction, CancellationToken ct = default);
    Task<IEnumerable<LinkedAccount>> GetLinkedAccountsAsync(Guid userId, CancellationToken ct = default);
}

public interface IUserCollectionRepository
{
    Task<UserCollection?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<UserCollection>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task AddItemAsync(Guid collectionId, CollectionItem item, IDbTransaction transaction, CancellationToken ct = default);
    Task RemoveItemAsync(Guid collectionId, int provider, string externalId, IDbTransaction transaction, CancellationToken ct = default);
}
```

---

## 4. Database TODO and Validation Roadmap

### Phase 1: Database Setup and Connection Management
- Setup NpgsqlDataSource connection factory targeting PostgreSQL 18 on Neon.
- Configure SSL and connection pooling options in appsettings.
- Implement HealthCheck endpoint executing `SELECT 1` via Dapper.

### Phase 2: Schema Migrations and Tooling
- Initialize DbUp migration project inside `api/src/Favorites.Infrastructure/Migrations`.
- Create SQL migration scripts for `users`, `linked_accounts`, `user_collections`, and `collection_items`.
- Create index migration for `collection_items` lookups.

### Phase 3: Dapper Repositories and Unit of Work
- Implement `UserRepository` with Dapper parameterized SQL queries for Google OAuth users and linked service tokens.
- Implement `UserCollectionRepository` with Dapper join queries mapping `CollectionItem` references.
- Implement `UnitOfWork` managing `NpgsqlTransaction` across multiple repositories.

### Phase 4: Query Optimization and Benchmark Validation
- Optimize collection queries using Dapper multi-mapping (`QueryAsync<UserCollection, CollectionItem, UserCollection>`).
- Verify query execution times remain under 10ms for collection item lookups.

### Phase 5: Testing and Verification
- Setup Testcontainers PostgreSQL 18 instance for database integration tests.
- Write integration tests for Google OAuth user registration and linked account token persistence.
- Write integration tests for concurrent collection item mutations and transactional rollback.
