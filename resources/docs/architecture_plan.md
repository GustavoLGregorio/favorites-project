# Favorites Platform - Architecture Plan & Aggregator Specification

## 1. Overview
The Favorites platform is a high-performance API aggregator and unified account hub designed to aggregate, organize, and monitor media consumption across diverse formats (Movies, Anime, TV Series, Books, Manga, and Video Games).

Instead of storing media metadata in a local database, the platform operates as a "blind centralizer" and real-time aggregator. It queries external services and APIs (TMDB, IMDb, MyAnimeList, AniList, IGDB, OpenLibrary) via edge proxies, while unifying user identities through **Google OAuth 2.0** and allowing users to link external service accounts to sync their existing libraries.

## 2. Technology Stack
- **Authentication Provider:** Google OAuth 2.0 (Identity Provider & Core Authentication)
- **Backend (Core API):** C# 14 / ASP.NET Core .NET 10 API (Domain logic, user collections, account integrations, CQRS)
- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + TypeScript 7.0 (Bun runtime)
- **Database:** PostgreSQL 18 (hosted on Neon Serverless) for Users, Linked Service Tokens, User Collections, and Collection Item References
- **Object Storage / CDN:** Cloudflare R2 (for user avatars and proxy asset fallbacks)
- **Caching & Edge Computing:** Cloudflare KV + Cloudflare Workers (as API Proxy, Aggregator, and Read-Cache Layer)
- **Design System:** Headless UI v2 + Tailwind CSS v4 + Google Stitch MCP integration

## 3. Monorepo Project Structure
```text
favorites-project/
├── frontend/    # Next.js 16, Tailwind CSS v4, Bun, TanStack Query v5
├── api/         # C# ASP.NET Core .NET 10 (DDD, Dapper, Serilog)
├── workers/     # Cloudflare Workers (API Aggregator, KV Read Cache, Account Sync)
└── resources/   # Architecture and engineering documentation
```

## 4. Core Strategies & Architectural Principles

### 4.1 API Aggregator & Account Unification
- **No Internal Media Metadata Database**: Media metadata (synopses, release dates, cast, developers, episode counts) is never stored locally. External APIs are the single source of truth.
- **Google OAuth 2.0 Core Identity**: Primary authentication is handled strictly via Google OAuth 2.0.
- **Third-Party Account Linking & Library Import**: Users can link external service accounts (e.g., MyAnimeList, AniList, Steam, Trakt) to automatically import/sync their watch/read/play histories into unified collections.
- **Blind Centralization**: Users can also manually build mixed-media collections ("The Witcher Franchise" combining books, games, and series) by adding items referenced by provider name and external ID.

### 4.2 Database Modeling (User-Centric & Light-Footprint)
- **User Identity & Linked Accounts (`users`, `linked_accounts`)**: Stores Google profile metadata, JWT sessions, and encrypted OAuth tokens for linked services.
- **User Collections (`user_collections`)**: Stores user-created custom list headers (Title, Description, Visibility).
- **Collection Items (`collection_items`)**: Stores user list entries referencing external providers (`provider` enum, `external_id` string), user ratings (1.0 - 10.0), consumption statuses ("Watching", "Reading", "Playing", etc.), and personal notes.

### 4.3 Cloudflare Edge Proxy & Caching Strategy
- **Aggregator Edge Layer (Cloudflare Workers)**: Workers act as an API Proxy, executing parallel requests to third-party APIs (TMDB, MAL, IGDB, OpenLibrary) and normalizing payloads into unified DTOs.
- **Read-Cache (Cloudflare KV)**: External API responses and search autocomplete results are cached in Cloudflare KV to prevent third-party rate limits and maintain ultra-low latencies (< 15ms).
- **Direct Edge Invalidation & On-Demand Sync**: Cache purges and library sync jobs execute asynchronously at the edge without putting load on the Core API database.
