# Favorites Platform - Frontend Architecture & Implementation Specification

This document details the architectural design, directory layout, rendering strategy, data fetching layer, component composition patterns, and implementation roadmap for the Favorites web application client.

## Documentation Navigation Matrix

| Specification | Description | Document Link |
| :--- | :--- | :--- |
| **Global Baseline** | System architecture, monorepo setup, Docker environment, and core engineering standards. | **[globals.md](./globals.md)** |
| **Frontend Architecture** | Next.js 16 (App Router), React 19, TypeScript 7.0 (ESNext), Bun runtime, TanStack Query v5, Axios. | **[frontend.md](./frontend.md)** (Current Document) |
| **Core API Architecture** | C# 14, ASP.NET Core .NET 10 API, Rigid DDD, Dapper, Serilog Global Logger, OOP Patterns. | **[api.md](./api.md)** |
| **Database Architecture** | PostgreSQL 18 (Neon DB), Lightweight schema, Dapper mapping, Unit of Work. | **[database.md](./database.md)** |
| **Workers & Edge Layer** | Cloudflare Workers API Proxy, Cloudflare KV read-caching, External Service Sync & Miniflare emulation. | **[workers.md](./workers.md)** |

---

## 1. Technology Stack & Environment

- **Framework**: Next.js 16 (App Router paradigm with Turbopack as default bundler) with React 19.
- **Runtime & Package Manager**: Bun (`>= 1.2.0`).
- **Language Compiler**: TypeScript 7.0 (Go-powered compiler) configured with `"target": "ESNext"` and `"moduleResolution": "Bundler"` (or `"TSNext"`).
- **Authentication**: Google OAuth 2.0 Client SDK / JWT Session Handler.
- **Data Fetching & Caching**: **TanStack Query (v5)** paired with **Axios** HTTP client.
- **Styling**: Tailwind CSS v4 featuring modern CSS variables.
- **Variant Engine**: Class Variance Authority (`cva`) for type-safe component variant styling.
- **Component Primitives**: Headless UI v2 (accessible, unstyled dropdowns, dialogs, popovers, tabs).
- **Design System**: Google Stitch MCP workflow for generating component visuals and syncing tokens.

---

## 2. Paradigm & Design Patterns Guidelines

### 2.1 Pure Functional Programming (FP) in React
All frontend code strictly follows Functional Programming principles:
- **Function Components & Custom Hooks Only**: Class components are prohibited.
- **Immutability & Pure Transformations**: Props and state are treated as immutable. Side effects are strictly confined to `useEffect` or TanStack Query mutations.
- **Pragmatic JS Performance**: Standard JavaScript `for` or `for...of` loops are permitted for performance-critical list processing to avoid heavy third-party FP libraries (e.g., fp-ts or Ramda).

### 2.2 Named React Design Patterns & Composition Strategy
To prevent monolithic "do-it-all" components receiving dozens of props, UI components hide internal complexity and expose clean composition boundaries:

1. **Compound / Composite Components Pattern**: Complex UI structures (e.g., `<MediaCard>`, `<TabGroup>`, `<CollectionList>`) export sub-components that share implicit state via React Context (e.g., `<MediaCard.Cover>`, `<MediaCard.Title>`, `<MediaCard.Rating>`).
2. **Variant Pattern (CVA)**: Visual component states (sizes, button variants, badges) are abstracted into variant definitions using `class-variance-authority` (`cva`), keeping component prop interfaces small and clean.
3. **Headless Logic via Custom Hooks**: Data fetching, state management, and event handlers are extracted into custom hooks (e.g., `useGoogleAuth`, `useExternalMedia`, `useCollectionTracker`), leaving UI components strictly responsible for rendering.

---

## 3. Centralized Key Factories (Query & Storage Tracking)

To eliminate loose string literals across the codebase, all cache keys and storage keys are centralized into typed factory objects.

### 3.1 Centralized TanStack Query Keys (`queryKeys.ts`)

```typescript
export const queryKeys = {
  auth: {
    user: () => ['auth', 'user'] as const,
    linkedAccounts: () => ['auth', 'linked-accounts'] as const,
  },
  externalMedia: {
    all: ['external-media'] as const,
    search: (provider: string, query: string) => [...queryKeys.externalMedia.all, 'search', provider, query] as const,
    details: (provider: string, externalId: string) => [...queryKeys.externalMedia.all, 'detail', provider, externalId] as const,
  },
  collections: {
    all: ['collections'] as const,
    detail: (id: string) => [...queryKeys.collections.all, id] as const,
    userLists: (userId: string) => [...queryKeys.collections.all, 'user', userId] as const,
  },
} as const;
```

### 3.2 Centralized Storage & Cookie Keys (`storageKeys.ts`)

```typescript
export const storageKeys = {
  local: {
    theme: 'favorites_theme_mode',
    userPreferences: 'favorites_user_prefs',
  },
  session: {
    activeTab: 'favorites_active_media_tab',
    searchDraft: 'favorites_search_query_draft',
  },
  cookies: {
    authToken: 'favorites_auth_token',
    refreshToken: 'favorites_refresh_token',
    googleIdToken: 'favorites_google_id_token',
  },
} as const;
```

---

## 4. Package Directory Layout & TypeScript Configuration

The frontend application resides in `frontend/`:

```text
frontend/
├── package.json               # Package config & Bun scripts
├── next.config.ts             # Next.js 16 configuration (Turbopack, ISR, image domains)
├── tailwind.config.ts         # Centralized Tailwind design tokens & themes
├── tsconfig.json              # TypeScript 7.0 config (target: ESNext, moduleResolution: Bundler/TSNext)
└── src/
    ├── app/                   # App Router pages
    │   ├── layout.tsx         # Root layout & TanStack Query Provider
    │   ├── page.tsx           # Landing page with Google OAuth button
    │   ├── search/page.tsx    # Global multi-provider search catalog
    │   ├── media/[provider]/[externalId]/page.tsx # Media detail page (queries Cloudflare Workers proxy)
    │   ├── lists/
    │   │   └── [listId]/page.tsx # Mixed-media collection page
    │   └── settings/
    │       └── integrations/page.tsx # External account linking (MAL, Steam, Trakt, AniList)
    ├── components/            # UI components adhering to Composition Patterns
    │   ├── ui/                # CVA primitives (Button, Badge, Modal, Input)
    │   ├── auth/              # Google OAuth login buttons & profile menu
    │   ├── integrations/      # Linked account card & OAuth authorization triggers
    │   ├── media/             # Compound MediaCard components (<MediaCard.Cover>, etc.)
    │   ├── lists/             # Smart Tab switcher & composite list items
    │   └── layout/            # Navigation bar, Sidebar, Glassmorphic header
    ├── api/                   # Axios HTTP client configuration & endpoint services
    │   ├── client.ts          # Axios instance with interceptors
    │   ├── auth-api.ts        # Google Auth & linked accounts API
    │   └── worker-proxy-api.ts# Worker Edge API proxy client
    ├── constants/
    │   ├── query-keys.ts      # Centralized Query Key Factory
    │   └── storage-keys.ts    # Centralized Storage & Cookie Key Factory
    ├── hooks/                 # Custom React hooks encapsulating headless logic
    │   ├── use-google-auth.ts # Google OAuth login mutation hook
    │   ├── use-external-media.ts # TanStack Query wrapper hook for worker API proxy
    │   └── use-storage.ts     # Typed localStorage / sessionStorage wrapper
    └── utils/                 # Pure utility functions (clsx, formatters)
```

---

## 5. Comprehensive Frontend TODO & Validation Roadmap

### Phase 1: Setup & Data Fetching Infrastructure
- Initialize Next.js 16, Bun 1.2+, TypeScript 7.0 (target: ESNext), and Tailwind CSS v4 in `frontend/`.
- Install TanStack Query v5, Axios, and Class Variance Authority (`cva`).
- Configure Axios client (`src/api/client.ts`) with request/response interceptors for JWT bearer tokens.
- Setup `QueryClientProvider` in Root Layout (`app/layout.tsx`).

### Phase 2: Centralized Key Factories & Google OAuth Integration
- Create `src/constants/query-keys.ts` with strongly-typed query key factory object.
- Create `src/constants/storage-keys.ts` with centralized keys for localStorage, sessionStorage, and cookies.
- Build `useGoogleAuth` hook for handling Google OAuth 2.0 login callbacks and session persistence.

### Phase 3: Component Composition & Design System
- Configure Tailwind CSS v4 tokens and Headless UI v2 primitives.
- Build CVA-based UI components (`Button`, `Badge`, `Modal`) avoiding prop bloat.
- Implement Compound Component pattern for `<MediaCard>` (`<MediaCard.Cover>`, `<MediaCard.Title>`, `<MediaCard.Rating>`).
- Implement Linked Account Cards in Integrations Settings page (`/settings/integrations/page.tsx`).

### Phase 4: Media Search & Detail Pages via Worker Edge Proxy
- Build Search Catalog page (`/search/page.tsx`) querying third-party APIs via Cloudflare Workers edge proxy.
- Build Media Detail page (`/media/[provider]/[externalId]/page.tsx`) rendering real-time aggregated specifications.
- Implement "Add to Collection" mutation hook with optimistic cache updates via `queryClient.setQueryData`.

### Phase 5: Mixed Collections & Service Sync
- Build Collection Detail page (`/lists/[listId]/page.tsx`) rendering mixed media items using `(provider, external_id)`.
- Implement manual and automatic "Sync Library" action triggers for linked accounts.

### Phase 6: Testing & Quality Assurance
- Write unit tests for `queryKeys` and `storageKeys` factories.
- Write component tests for `<MediaCard>` compound components using Vitest and React Testing Library.
- Write Playwright E2E tests for Google OAuth login flow, multi-provider search, and collection mutations.
- Verify zero raw string literals are used for TanStack Query keys or browser storage keys.
