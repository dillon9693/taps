# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Taps is a beer discovery application with a React frontend and Django/GraphQL backend. The front-end is deployed using [Vercel](https://vercel.com), and the back-end is deployed using [Railway](https://railway.com/). The application allows users to browse and search for beers, view brewery information, and discover featured beers.

## Architecture

### Frontend (client/)

- **React 18** with TypeScript using Create React App
- **Apollo Client** for GraphQL data fetching and caching
- **Mantine** for components, styling, and theming system
- **React Router** for client-side routing
- Main routes: Home (`/home`) and Search (`/search`)
- GraphQL queries defined in `src/graphql/queries.ts`
- Type definitions in `src/types/beer.ts`

### Backend (taps-backend/)

- **Django 5.1** with Python 3.11+
- **Graphene-Django** for GraphQL API
- **PostgreSQL** for production database
- **Redis** for rate limiting cache
- Core models: `Beer`, `Brewery`, `Tag` in `taps/models.py`
- GraphQL schema in `taps/schema.py` with queries for beers, breweries, and tags
- **Poetry** for dependency management
- **Rate limiting** implemented via custom middleware and decorators

## Development Commands

### Frontend (client/)

```bash
cd client
npm install              # Install dependencies
npm start               # Development server (port 3000)
npm test               # Run tests
npm run build          # Production build
npm run lint           # ESLint (includes Prettier formatting checks)
npm run format         # Format with Prettier
npm run format:check   # Check formatting without changes
```

### Backend (taps-backend/)

```bash
cd taps-backend
poetry install                              # Install dependencies
poetry run python manage.py runserver 8000 # Development server
poetry run python manage.py migrate        # Run migrations
poetry run python manage.py test          # Run tests
poetry run python manage.py add_sample_data # Create sample data
poetry run python manage.py createsuperuser # Create admin user
poetry run ruff format .                   # Format code
poetry run ruff check .                    # Lint code
```

### Docker Development

```bash
docker compose up                                           # Start all services (db, redis, backend, frontend)
docker compose down                                         # Stop all services
docker compose exec backend poetry run python manage.py add_sample_data  # Add sample data
docker compose exec backend poetry run python manage.py createsuperuser  # Create admin user
```

**Note:** Docker Compose includes a Redis service for rate limiting. The backend depends on Redis being healthy before starting.

## Key Configuration

### Environment Variables

- Frontend: `REACT_APP_API_URL` (defaults to http://localhost:8000/graphql)
- Backend: Uses django-environ for configuration
  - `DATABASE_URL`: PostgreSQL connection string
  - `REDIS_URL`: Redis connection string (required for rate limiting)
  - `SECRET_KEY`: Django secret key
  - `FRONTEND_URL`: Frontend URL for CORS and password reset emails

### Code Quality

- Frontend: ESLint with Airbnb config, Prettier integration via eslint-plugin-prettier
- Backend: Ruff for formatting and linting, Black for formatting
- Both: TypeScript strict mode enabled

### Testing

- Frontend: React Testing Library with Jest
- Backend: Django test framework
- CI runs both test suites on pull requests

## GraphQL API

### Rate Limiting

The API implements rate limiting to protect against abuse:

**Rate Limit Tiers:**
- Anonymous users:
  - Queries: 100 requests / 15 minutes
  - Mutations: 20 requests / 15 minutes
  - Auth mutations (login, register, password reset): 5 requests / 15 minutes
- Authenticated users:
  - Queries: 500 requests / 15 minutes
  - Mutations: 100 requests / 15 minutes
  - Auth mutations: 10 requests / 15 minutes

**Implementation:**
- Base rate limiting via `GraphQLRateLimitMiddleware` in `taps_backend/middleware.py`
- Fine-grained limits via `@graphql_ratelimit` decorator on mutation resolvers
- Rate limit tracking stored in Redis cache
- Returns GraphQL error with code `RATE_LIMIT_EXCEEDED` when limit exceeded

### Key Queries

- `allBeers`: Search and filter beers by style, ABV, search term
- `featuredBeers`: Top-rated beers for homepage
- `allBreweries`: Search breweries by location or name
- `topTags`: Most popular beer tags

### Sample Query

```graphql
query GetFeaturedBeers {
  featuredBeers {
    id
    name
    brewery {
      name
      location
    }
    style
    abv
    description
    averageRating
  }
}
```

## Deployment

- Frontend: Vercel (configured via vercel.json)
- Backend: Railway
- Database: Railway PostgreSQL
- Redis: Railway Redis (must be provisioned separately for production)
- CI/CD: GitHub Actions with separate workflows for frontend and backend testing

**Production Setup Notes:**
- Redis must be manually provisioned in Railway and connected to the backend service
- Set `REDIS_URL` environment variable in Railway to the Redis connection string

## Data Models

- **Beer**: Core entity with brewery relationship, style, ABV, IBU, ratings, tags
- **Brewery**: Beer producer with location and metadata
- **Tag**: Categorization system for beers (many-to-many with Beer)

## Common Tasks

When adding new features:

1. Update GraphQL schema in backend if needed
2. Add TypeScript types in frontend
3. Update queries in `src/graphql/queries.ts`
4. Create/update components in `src/components/` or `src/routes/`
5. Run linting and formatting before committing
6. Ensure tests pass in CI

When modifying the backend:

1. Create migrations: `poetry run python manage.py makemigrations`
2. Apply migrations: `poetry run python manage.py migrate`
3. Update GraphQL schema if models change
4. Run format and lint checks before committing

## Implementation Best Practices

These rules ensure maintainability, safety, and developer velocity.
**MUST** rules are enforced by CI; **SHOULD** rules are strongly recommended.

### 1 — Before Coding

- **BP-1 (MUST)** Ask the user clarifying questions.
- **BP-2 (SHOULD)** Draft and confirm an approach for complex work.
- **BP-3 (SHOULD)** If ≥ 2 approaches exist, list clear pros and cons.
- **BP-4 (MUST)** When a plan is agreed upon with the user, create a plan document in `.agents/plans` following the format described in `.agents/plans/example.md`
- **BP-5 (SHOULD)** If a plan changes during implementation, update the related plan document accordingly.
- **BP-6 (MUST)** Commit the plan file to Git when the plan is complete

### 2 - While Coding

- **C-1 (MUST)** Follow TDD: scaffold stub -> write failing test -> implement.
- **C-2 (MUST)** Name functions with existing domain vocabulary for consistency.
- **C-3 (SHOULD NOT)** Introduce classes when small testable functions suffice.
- **C-4 (SHOULD)** Prefer simple, composable, testable functions.
- **C-6 (MUST)** Use `import type { … }` for type-only imports.
- **C-7 (SHOULD NOT)** Add comments except for critical caveats; rely on self‑explanatory code.
- **C-8 (SHOULD)** Default to `type`; use `interface` only when more readable or interface merging is required.
- **C-9 (SHOULD NOT)** Extract a new function unless it will be reused elsewhere, is the only way to unit-test otherwise untestable logic, or drastically improves readability of an opaque block.

### 3 - Git

- **GH-1 (MUST)** Use Conventional Commits format when writing commit messages: https://www.conventionalcommits.org/en/v1.0.0
- **GH-2 (SHOULD NOT)** Refer to Claude or Anthropic in commit messages.
- **GH-3 (MUST)** When implementing a change, create a feature branch off of `main` with the name format `feature/<description>`, replacing `<description>` with a brief description of the feature
- **GH-4 (MUST)** Run front-end and back-end checks locally before pushing to remote.
- **GH-5 (SHOULD)** Unless otherwise specified, open PRs against the `main` branch
- **GH-6 (SHOULD)** Unless otherwise specified, compare changes againast the `main` branch, NOT THE `develop` branch
- **GH-7 (SHOULD)** Break feature implementation into logical commits. When in doubt, commit more often than not.

#### 4 - Local Development

- **LD-1 (MUST)** Test locally using docker-compose, not Python or Node on the local machine

#### 5 - Python

- **PY-1 (MUST)** Install dependencies using poetry CLI commands (e.g. `poetry add`), not by adding to pyproject.toml directly

#### 6 - Django

- **DJ-1 (SHOULD)** Environment-specific settings should be set in the corresponding environment file (`production_settings.py` for production and `development_settings.py` for development), not conditionally in the shared `settings.py`
