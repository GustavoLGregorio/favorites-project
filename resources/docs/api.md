# Favorites Platform - Core API Architecture & Implementation Specification

This document details the architectural design, solution structure, rigid Domain-Driven Design (DDD) patterns, Dapper micro-ORM data access layer, Serilog global logging, and implementation roadmap for the Favorites Core API backend service.

## Documentation Navigation Matrix

| Specification | Description | Document Link |
| :--- | :--- | :--- |
| **Global Baseline** | System architecture, monorepo setup, Docker environment, and core engineering standards. | **[globals.md](./globals.md)** |
| **Frontend Architecture** | Next.js 16 (App Router), React 19, TypeScript 7.0 (ESNext), Bun runtime, TanStack Query v5, Axios. | **[frontend.md](./frontend.md)** |
| **Core API Architecture** | C# 14, ASP.NET Core .NET 10 API, Rigid DDD, Dapper, Serilog Global Logger, OOP Patterns. | **[api.md](./api.md)** (Current Document) |
| **Database Architecture** | PostgreSQL 18 (Neon DB), Lightweight schema, Dapper mapping, Unit of Work. | **[database.md](./database.md)** |
| **Workers & Edge Layer** | Cloudflare Workers API Proxy, Cloudflare KV read-caching, External Service Sync & Miniflare emulation. | **[workers.md](./workers.md)** |

---

## 1. Technology Stack & Environment

- **Framework**: ASP.NET Core Web API on **.NET 10** (**C# 14** featuring extension members, field keyword, and null-conditional assignment).
- **Authentication**: **Google OAuth 2.0** identity verification & JWT bearer token generation.
- **Architecture Pattern**: Rigid Domain-Driven Design (DDD) with Clean / Vertical Slice Architecture & CQRS (MediatR).
- **Global Structured Logging**: **Serilog** (`Serilog.AspNetCore`, `Serilog.Sinks.Console`, `Serilog.Sinks.File`) configured as the application-wide logger.
- **Data Access Micro-ORM**: **Dapper** (`Dapper`, `Npgsql`). For database schema details on PostgreSQL 18, consult **[database.md](./database.md)**.
- **External Integration Clients**: HttpClient / Refit targeting third-party APIs and Cloudflare Workers proxy endpoints.
- **Validation**: FluentValidation for request DTO validation.
- **Testing**: xUnit, FluentAssertions, NSubstitute, Testcontainers for integration tests against real PostgreSQL 18 instances.

---

## 2. Solution Directory Structure (Rigid DDD Layout)

The backend C# solution resides in the `api/` directory and adheres strictly to Object-Oriented Programming (OOP) and DDD aggregate boundaries:

```text
api/
├── Favorites.sln
├── Dockerfile                         # Production .NET 10 Dockerfile
└── src/
    ├── Favorites.Domain/              # Pure Domain Layer (Entities, Aggregates, Value Objects, Domain Events)
    │   ├── Common/
    │   │   ├── AggregateRoot.cs      # Base aggregate root with domain event collection
    │   │   ├── Entity.cs             # Base entity with typed ID equality
    │   │   ├── ValueObject.cs        # Immutable value object baseline
    │   │   └── IDomainEvent.cs       # Domain event marker interface
    │   ├── Aggregates/
    │   │   ├── UserAggregate/        # User Aggregate Root
    │   │   │   ├── User.cs           # User Entity (Google OAuth ID, Profile Info)
    │   │   │   ├── LinkedAccount.cs  # Entity representing connected services (MAL, Steam, etc.)
    │   │   │   ├── ServiceProvider.cs# Value Object (Enum: MAL, AniList, Steam, Trakt)
    │   │   │   └── Events/           # UserRegisteredEvent, LinkedAccountAddedEvent
    │   │   └── UserCollectionAggregate/
    │   │       ├── UserCollection.cs # Aggregate Root Entity
    │   │       ├── CollectionItem.cs # Internal Entity
    │   │       ├── ExternalMediaRef.cs# Value Object (Provider Enum + External ID string)
    │   │       ├── UserRating.cs     # Value Object (1.0 - 10.0 invariant validation)
    │   │       └── MediaStatus.cs    # Value Object (Watching, Reading, Playing, etc.)
    │   └── Repositories/             # DDD Repository Interfaces (NO SQL inside Domain)
    │       ├── IUserRepository.cs
    │       ├── IUserCollectionRepository.cs
    │       └── IUnitOfWork.cs
    ├── Favorites.Application/           # Application Layer (Use cases, CQRS, DTOs, Behaviors)
    │   ├── Auth/
    │   │   ├── Commands/             # AuthenticateWithGoogleCommand, RefreshTokenCommand
    │   │   └── Queries/              # GetUserProfileQuery
    │   ├── Integrations/
    │   │   ├── Commands/             # LinkExternalAccountCommand, SyncExternalLibraryCommand
    │   │   └── Queries/              # GetLinkedAccountsQuery
    │   ├── UserCollections/
    │   │   ├── Commands/             # CreateUserCollectionCommand, AddItemToCollectionCommand
    │   │   └── Queries/              # GetUserCollectionsQuery, GetCollectionByIdQuery
    │   └── Common/
    │       ├── Behaviors/            # LoggingBehavior (Serilog), ValidationBehavior
    │       └── Interfaces/           # IGoogleAuthService, IWorkerProxyClient
    ├── Favorites.Infrastructure/        # Infrastructure Layer (Dapper Repositories, Serilog, External Services)
    │   ├── Logging/
    │   │   └── SerilogConfiguration.cs # Global Serilog setup & enrichment
    │   ├── Persistence/
    │   │   ├── DapperContext.cs      # NpgsqlConnection factory
    │   │   ├── UnitOfWork.cs         # Dapper transaction management
    │   │   └── Repositories/         # Dapper implementations of IUserRepository, etc.
    │   ├── Auth/
    │   │   └── GoogleOAuthService.cs # Google OAuth 2.0 token validation
    │   └── External/
    │       └── WorkerProxyClient.cs  # Cloudflare Workers API Proxy client
    └── Favorites.Api/                 # API Entry Point (.NET 10 ASP.NET Core)
        ├── Controllers/ (or Endpoints/)
        ├── Middleware/                # SerilogRequestLogging, ExceptionHandling, RFC 7807 ProblemDetails
        ├── Program.cs                 # .NET 10 Host builder, Serilog bootstrap, DI
        └── appsettings.json
```

---

## 3. Named OOP & DDD Design Patterns

The C# codebase strictly enforces Object-Oriented Programming (OOP) and applies recognized GoF / Refactoring Guru design patterns:

1. **Aggregate Root Pattern**: Entities inside `Favorites.Domain` enforce invariants. `User` and `UserCollection` act as Aggregate Roots; internal entities (`LinkedAccount`, `CollectionItem`) cannot be mutated directly from outside their aggregate boundaries.
2. **Value Object Pattern**: `ExternalMediaRef` is an immutable Value Object encapsulating `(Provider, ExternalId)`, guaranteeing validity without storing duplicate metadata.
3. **Repository Pattern**: `IUserRepository` and `IUserCollectionRepository` abstract data access. Dapper repositories in `Favorites.Infrastructure` execute SQL queries without exposing persistence logic to the application layer.
4. **Unit of Work Pattern**: Manages `NpgsqlTransaction` lifetime across multiple repository writes to guarantee transactional consistency.
5. **Factory Pattern**: Static factory methods (e.g., `User.CreateFromGoogle(...)`) encapsulate creation logic and invariant validations.
6. **Strategy Pattern**: Encapsulates provider-specific token refresh strategies and API payload mapping.
7. **Mediator Pattern**: Implemented via MediatR to decouple HTTP endpoints from application command/query handlers.

---

## 4. Serilog Global Logger Configuration

Serilog is registered as the single global logger for the entire application, writing structured JSON logs with context enrichment (CorrelationId, UserId, ExecutionTime):

```csharp
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
```

---

## 5. Comprehensive Core API TODO & Validation Roadmap

### Phase 1: .NET 10 Solution & Serilog Setup
- Create C# solution `Favorites.sln` with `Domain`, `Application`, `Infrastructure`, and `Api` projects targeting .NET 10 (C# 14).
- Configure Serilog global structured logger with Console and File sinks in `Favorites.Api`.
- Setup RFC 7807 `ProblemDetails` global exception handling middleware.
- Setup Swagger/OpenAPI documentation generation.

### Phase 2: Google OAuth 2.0 & Identity Layer
- Implement `GoogleOAuthService` for validating Google ID tokens and retrieving profile claims.
- Build `User` aggregate root and `LinkedAccount` entity with static factory methods.
- Implement `AuthenticateWithGoogleCommand` handler issuing JWT bearer tokens.
- Write unit tests validating Google token exchange and user creation invariants.

### Phase 3: Dapper Infrastructure & Unit of Work
- Setup `DapperContext` providing `NpgsqlConnection` instances targeting PostgreSQL 18.
- Implement `IUserRepository` using Dapper queries for users and linked service credentials (consult **[database.md](./database.md)**).
- Implement `IUserCollectionRepository` using Dapper queries mapping `ExternalMediaRef` value objects.
- Implement `UnitOfWork` wrapping `NpgsqlTransaction`.

### Phase 4: Application Layer CQRS & Integration Handlers
- Implement `LinkExternalAccountCommand` for connecting MyAnimeList, AniList, Steam, and Trakt accounts.
- Implement `AddItemToCollectionCommand` handler storing `ExternalMediaRef` (provider + external_id) along with rating and status invariants.
- Implement `GetUserCollectionsQuery` handler using Dapper read queries.
- Configure MediatR `LoggingBehavior` with Serilog context enrichment.

### Phase 5: Cloudflare Worker Proxy Integration
- Implement `WorkerProxyClient` to fetch aggregated media details and search results from Cloudflare Workers edge endpoints.
- Implement `SyncExternalLibraryCommand` dispatching background import jobs to Workers.

### Phase 6: Testing & Quality Assurance
- Write domain unit tests ensuring zero infrastructure dependencies in `Favorites.Domain`.
- Write Dapper repository integration tests using Testcontainers for PostgreSQL 18.
- Write API integration tests using `WebApplicationFactory` for Google OAuth and collection endpoints.
- Validate Serilog log outputs contain correlation IDs and structured JSON fields.
