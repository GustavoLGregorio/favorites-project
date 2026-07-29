# Favorites Platform - Workers & Edge Layer Specification

This document details the architectural design, Wrangler configuration, Cloudflare KV read-caching, API Proxy modules, and implementation roadmap for the Workers & Edge Layer.

## Documentation Navigation Matrix

| Specification | Description | Document Link |
| :--- | :--- | :--- |
| **Global Baseline** | System architecture, monorepo setup, Docker environment, and core engineering standards. | **[globals.md](./globals.md)** |
| **Frontend Architecture** | Next.js 16 (App Router), React 19, TypeScript 7.0 (ESNext), Bun runtime, TanStack Query v5, Axios. | **[frontend.md](./frontend.md)** |
| **Core API Architecture** | C# 14, ASP.NET Core .NET 10 API, Rigid DDD, Dapper, Serilog Global Logger, OOP Patterns. | **[api.md](./api.md)** |
| **Database Architecture** | PostgreSQL 18 (Neon DB), Lightweight schema, Dapper mapping, Unit of Work. | **[database.md](./database.md)** |
| **Workers & Edge Layer** | Cloudflare Workers API Proxy, Cloudflare KV read-caching, External Service Sync & Miniflare emulation. | **[workers.md](./workers.md)** (Current Document) |

---

## 1. Technology Stack & Edge Runtime

- **Runtime**: Cloudflare Workers V8 Edge Runtime with TypeScript 7.0 (`"target": "ESNext"`).
- **HTTP Framework**: Hono lightweight edge framework.
- **CLI & Deployment**: Wrangler CLI v3.
- **Local Emulator**: Miniflare v3 (integrated with `bun dev:workers` and Docker Compose).
- **Key-Value Cache**: Cloudflare KV Namespaces (`FAVORITES_READ_CACHE`).
- **Object Storage Binding**: Cloudflare R2 Bucket (`favorites-media-assets`).
- **Testing**: Vitest with `@cloudflare/vitest-pool-workers`.

---

## 2. Monorepo Workers Package Layout

The Cloudflare Workers codebase resides in `workers/`:

```text
workers/
├── package.json               # Package configuration & Wrangler dependencies
├── wrangler.toml              # Cloudflare Workers, KV, and R2 bindings config
├── tsconfig.json              # TypeScript 7.0 config (target: ESNext)
└── src/
    ├── index.ts               # Worker entry point & HTTP router (Hono)
    ├── proxies/               # Third-party API proxy & normalizer modules
    │   ├── tmdb-proxy.ts      # Movies & TV Series proxy (TMDB API)
    │   ├── mal-proxy.ts       # Anime & Manga proxy (MyAnimeList / AniList APIs)
    │   ├── igdb-proxy.ts      # Video Games proxy (IGDB / Twitch API)
    │   └── openlibrary-proxy.ts # Books metadata proxy (OpenLibrary / Google Books API)
    ├── cache/
    │   ├── kv-cache-manager.ts # Read-cache get, put, and tag invalidation logic
    │   └── cache-keys.ts      # Standardized KV cache key generators
    ├── sync/
    │   ├── mal-sync.ts        # MyAnimeList library import handler
    │   ├── steam-sync.ts      # Steam game library import handler
    │   └── trakt-sync.ts      # Trakt watch history import handler
    └── cron/
        └── library-sync.ts    # Scheduled background sync job for linked user accounts
```

---

## 3. Wrangler Configuration & Bindings (`wrangler.toml`)

```toml
name = "favorites-workers"
main = "src/index.ts"
compatibility_date = "2026-07-01"
compatibility_flags = ["nodejs_compat"]

# Cloudflare KV Read-Cache Binding
[[kv_namespaces]]
binding = "FAVORITES_READ_CACHE"
id = "favorites_cache_prod_id"
preview_id = "favorites_cache_preview_id"

# Cloudflare R2 Object Storage Binding
[[r2_buckets]]
binding = "MEDIA_ASSETS_BUCKET"
bucket_name = "favorites-media-assets"
preview_bucket_name = "favorites-media-assets-preview"

# Scheduled Cron Jobs for Background Library Sync
[triggers]
crons = ["0 3 * * *"] # Every day at 03:00 AM UTC
```

---

## 4. Edge Layer Responsibilities & Workflows

### 4.1 Real-Time API Aggregator & Normalizer
1. The frontend or Core API dispatches a request to `/api/proxy/media?provider=TMDB&externalId=550`.
2. The Worker checks Cloudflare KV (`FAVORITES_READ_CACHE`) for cached DTOs (`media:proxy:TMDB:550`).
3. If missed, the Worker queries TMDB API in real-time, normalizes the raw JSON response into a standardized `MediaItemDto` structure, and caches it in KV with a 24-hour TTL.
4. The normalized DTO is returned instantly to the caller.

### 4.2 Account Library Sync Workflow
1. When a user links an external account (e.g., MyAnimeList), the Core API emits a sync request to `/api/sync/mal`.
2. The Worker uses the user's OAuth access token to fetch their watch history directly from MyAnimeList.
3. The Worker converts entries into `(provider, external_id, rating, status)` pairs and batch posts them to the C# Core API to insert into `collection_items`.

---

## 5. Comprehensive Workers TODO & Validation Roadmap

### Phase 1: Setup & Wrangler Environment
- Initialize `workers/` package with Wrangler v3, TypeScript 7.0 (ESNext), and Bun 1.2+.
- Configure `wrangler.toml` with KV namespace bindings (`FAVORITES_READ_CACHE`) and R2 bucket bindings (`MEDIA_ASSETS_BUCKET`).
- Set up Miniflare integration for local emulator support in Docker Compose and `bun dev:workers`.
- Install and configure Hono framework as lightweight HTTP router inside the worker.

### Phase 2: External API Proxy Modules & Normalizers
- Implement `tmdb-proxy.ts` for fetching and caching movie and TV series metadata.
- Implement `mal-proxy.ts` for querying MyAnimeList/AniList APIs for anime and manga details.
- Implement `igdb-proxy.ts` for fetching video game specifications, developers, and platforms.
- Implement `openlibrary-proxy.ts` for fetching book page counts, ISBNs, and authors.
- Create unified metadata normalizer mapping third-party payloads to standardized DTOs.

### Phase 3: Cloudflare KV Caching & Rate-Limit Management
- Implement `kv-cache-manager.ts` with helper methods for reading, writing, and tagging cache entries.
- Implement search autocomplete caching middleware with 24-hour TTL.
- Implement rate-limiting and exponential backoff wrappers around third-party API fetch calls.

### Phase 4: Third-Party Account Sync Handlers
- Implement `mal-sync.ts` for importing MyAnimeList watch/read lists.
- Implement `steam-sync.ts` for importing Steam game library & playtime metrics.
- Implement `trakt-sync.ts` for importing Trakt show and movie histories.

### Phase 5: Cron Triggers & Async Background Sync
- Implement scheduled cron handler (`cron/library-sync.ts`) to periodically sync linked user accounts.

### Phase 6: Testing & Quality Assurance
- Write unit tests for all proxy parser modules using Vitest and mock HTTP responses.
- Write integration tests against Miniflare local emulator verifying KV write/read operations.
- Validate worker memory consumption remains under Cloudflare 128MB limit per execution.
- Benchmark worker response time for cached KV requests (< 15ms target latency).
