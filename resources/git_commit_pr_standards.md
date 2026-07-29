# Favorites Platform - Git Commit & Pull Request Standards

This document specifies the mandatory Git commit message format, Atomic Angular Prefix guidelines, and Pull Request (PR) standards for the Favorites monorepo.

## 1. Language Requirement
All Git commit titles, commit body descriptions, branch names, and Pull Request titles/descriptions **must be written strictly in English**.

---

## 2. Commit Message Structure

Every commit must follow the Atomic Angular Commit format:

```text
<prefix>(<scope>): <short title in imperative mood>

<concise body description explaining what changed and why>
```

### 2.1 Format Components
- **`prefix`**: Describes the type of change (see allowed prefixes below).
- **`scope`**: Identifies the monorepo package or component affected (in lowercase).
- **`title`**: A short summary (50 characters or less), written in the imperative present tense (e.g., `add google oauth button` instead of `added google oauth button`).
- **`body`**: A concise explanation of the motivation and technical changes.

---

## 3. Allowed Prefixes

| Prefix | Description | Example |
| :--- | :--- | :--- |
| **`feat`** | A new feature or capability for the user or system | `feat(auth): add google oauth login button` |
| **`fix`** | A bug fix or patch | `fix(api): correct jwt token expiration calculation` |
| **`docs`** | Documentation changes only | `docs(specs): update architecture for api aggregator model` |
| **`style`** | Code formatting, missing semi-colons, whitespace (no logic change) | `style(frontend): format tailwind utility classes` |
| **`refactor`** | Code changes that neither fix a bug nor add a feature | `refactor(api): extract google token validator into service` |
| **`perf`** | Code changes that improve runtime performance | `perf(workers): add kv cache read-through for tmdb proxy` |
| **`test`** | Adding missing tests or correcting existing tests | `test(api): add unit tests for google auth command handler` |
| **`build`** | Changes affecting the build system, Bun scripts, or project dependencies | `build(frontend): add class-variance-authority dependency` |
| **`ci`** | Changes to CI/CD workflows and deployment configurations | `ci(monorepo): setup github actions for docker build` |
| **`chore`** | Maintenance tasks, configuration edits, or environment updates | `chore(config): add env example templates across packages` |
| **`revert`** | Reverting a previous commit | `revert(api): revert breaking change to user aggregate` |

---

## 4. Allowed Scopes

| Scope | Package / Domain |
| :--- | :--- |
| **`monorepo`** | Root orchestrator, root scripts, Docker Compose |
| **`frontend`** | Next.js 16 client application |
| **`api`** | C# ASP.NET Core .NET 10 Web API |
| **`workers`** | Cloudflare Workers Edge API Proxy & sync jobs |
| **`database`** | PostgreSQL schema, Dapper mappings, DbUp migrations |
| **`auth`** | Google OAuth 2.0 authentication & JWT session management |
| **`docs`** | Architecture specs and engineering guides in `resources/` |
| **`config`** | Environment files (`.env`), tsconfig, linter configs |

---

## 5. Commit Examples

### Single-line Commit
```bash
git commit -m "feat(auth): implement google oauth handler endpoint"
```

### Multi-line Atomic Commit (Title + Concise Description)
```bash
git commit -m "feat(auth): implement google oauth authentication endpoint

Add AuthenticateWithGoogleCommand and Handler in Favorites.Application layer.
Validate Google ID token against tokeninfo endpoint and issue JWT bearer token."
```

---

## 6. Pull Request (PR) Guidelines

1. **PR Title**: Must follow the exact commit format: `<prefix>(<scope>): <title>`.
2. **Branch Naming**: Use `feature/<short-desc>`, `fix/<short-desc>`, or `chore/<short-desc>`.
3. **Target Branch**: Merges must target the `develop` branch.
4. **Description**: Detail the problem solved, list major changes, and outline testing steps.
5. **No Emojis**: Emojis are strictly prohibited in PR titles and commit messages.
