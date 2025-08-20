# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Taps is a beer discovery application with a React frontend, Django/GraphQL backend, and AWS CDK infrastructure. The application allows users to browse and search for beers, view brewery information, and discover featured beers.

## Architecture

### Frontend (client/)

- **React 18** with TypeScript using Create React App
- **Apollo Client** for GraphQL data fetching and caching
- **Material UI** for components and styling
- **React Router** for client-side routing
- Main routes: Home (`/home`) and Search (`/search`)
- GraphQL queries defined in `src/graphql/queries.ts`
- Type definitions in `src/types/beer.ts`

### Backend (taps-backend/)

- **Django 5.1** with Python 3.11+
- **Graphene-Django** for GraphQL API
- **PostgreSQL** for production database
- Core models: `Beer`, `Brewery`, `Tag` in `taps/models.py`
- GraphQL schema in `taps/schema.py` with queries for beers, breweries, and tags
- **Poetry** for dependency management

### Infrastructure (infrastructure/)

- **AWS CDK** with TypeScript for infrastructure as code
- Modular stack architecture: network, database, compute, and domain stacks
- Separate staging and production environments

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

### Infrastructure (infrastructure/)

```bash
cd infrastructure
npm install          # Install dependencies
npm run build       # Compile TypeScript
npm run test        # Run tests
npx cdk deploy      # Deploy to AWS
npx cdk diff        # Compare with deployed stack
npx cdk synth       # Generate CloudFormation
```

### Docker Development

```bash
docker compose up                                           # Start all services
docker compose down                                         # Stop all service
docker compose exec backend poetry run python manage.py add_sample_data  # Add sample data
docker compose exec backend poetry run python manage.py createsuperuser  # Create admin user
```

## Key Configuration

### Environment Variables

- Frontend: `REACT_APP_API_URL` (defaults to http://localhost:8000/graphql)
- Backend: Uses django-environ for configuration

### Code Quality

- Frontend: ESLint with Airbnb config, Prettier integration via eslint-plugin-prettier
- Backend: Ruff for formatting and linting, Black for formatting
- Both: TypeScript strict mode enabled

### Testing

- Frontend: React Testing Library with Jest
- Backend: Django test framework
- CI runs both test suites on pull requests

## GraphQL API

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
- Backend: AWS ECS with CDK
- Database: AWS RDS PostgreSQL
- CI/CD: GitHub Actions with separate workflows for frontend and backend testing

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

### 2 - While Coding

- **C-1 (MUST)** Follow TDD: scaffold stub -> write failing test -> implement.
- **C-2 (MUST)** Name functions with existing domain vocabulary for consistency.
- **C-3 (SHOULD NOT)** Introduce classes when small testable functions suffice.
- **C-4 (SHOULD)** Prefer simple, composable, testable functions.
- **C-6 (MUST)** Use `import type { … }` for type-only imports.
- **C-7 (SHOULD NOT)** Add comments except for critical caveats; rely on self‑explanatory code.
- **C-8 (SHOULD)** Default to `type`; use `interface` only when more readable or interface merging is required.
- **C-9 (SHOULD NOT)** Extract a new function unless it will be reused elsewhere, is the only way to unit-test otherwise untestable logic, or drastically improves readability of an opaque block.

### 7 - Git

- **GH-1 (MUST**) Use Conventional Commits format when writing commit messages: https://www.conventionalcommits.org/en/v1.0.0
- **GH-2 (SHOULD NOT**) Refer to Claude or Anthropic in commit messages.
