**Date created:** 2025-01-17
**Date updated:** 2025-01-17

# Description

Add comprehensive type hints to the Python backend codebase and integrate mypy type checking into the CI pipeline. This will improve code quality, catch type-related bugs before deployment, and enhance developer experience with better IDE support.

**Github issue:** https://github.com/dillon9693/taps/issues/94

# Changes required

## 1. Dependencies & Configuration

### Install Type Checking Tools
- Add `mypy` to Poetry dev dependencies
- Add `django-stubs[compatible-mypy]` for Django ORM type stubs
- Add `types-requests` for requests library type stubs (used in import_brewery_data.py)

### Configure mypy
- Add mypy configuration to `pyproject.toml` with:
  - Strict mode enabled for new code
  - Django plugin enabled
  - Gradual adoption settings (allow untyped calls initially)
  - Exclude migrations and test files from strict checks

## 2. Add Type Hints to Core Application Files (Priority Tier 1)

### `taps/models.py` (~132 lines)
- Add return type hints to all model methods
- Add type hints for class methods (e.g., `TagVote.vote_count`)
- Type Django field relationships (ForeignKey, ManyToMany)
- Add `QuerySet` generic types where appropriate

### `taps/schema.py` (~643 lines)
- Add type hints to all GraphQL resolver methods
- Type mutation methods with proper return types
- Add type hints for `info` parameter using `graphene.ResolveInfo`
- Type all method parameters and return values

### `taps/decorators.py` (~84 lines)
- Add proper type hints for the `login_required` decorator
- Use `TypeVar` and `ParamSpec` for generic function typing
- Type the wrapper function signature

### `taps/views.py` (~18 lines)
- Add `HttpRequest` and `HttpResponse` type hints
- Type all view function parameters and returns

### `taps/admin.py` (~10 lines)
- Add type hints for admin registration

## 3. Add Type Hints to Management Commands (Priority Tier 2)

### `taps/management/commands/add_sample_data.py` (~235 lines)
- Type the `handle()` method
- Add type hints for helper methods
- Type command options dictionary

### `taps/management/commands/import_brewery_data.py` (~169 lines)
- Type the `handle()` and `add_arguments()` methods
- Add type hints for data processing methods
- Type HTTP response handling

## 4. CI Integration

### Update GitHub Actions Workflow
- Add mypy check to `.github/workflows/backend-tests.yml`
- Run mypy as a separate CI step after dependencies are installed
- Ensure type check failures block PR merges
- Add caching for mypy to speed up CI runs

### Configuration Files
- Create `py.typed` marker file if needed for the package
- Update pre-commit hooks if applicable

## 5. Documentation
- Update README or contributing docs with type checking guidelines
- Document how to run mypy locally: `poetry run mypy taps/`

# Implementation Order

1. **Setup Phase**
   - Create feature branch: `feature/python-type-hints`
   - Install mypy and stubs via Poetry
   - Configure mypy in pyproject.toml

2. **Core Application (Tier 1)** - Implement in this order:
   - `taps/views.py` (simplest, 18 lines)
   - `taps/admin.py` (simple, 10 lines)
   - `taps/models.py` (moderate, 132 lines)
   - `taps/decorators.py` (complex, 84 lines)
   - `taps/schema.py` (largest, 643 lines)

3. **Management Commands (Tier 2)**
   - `taps/management/commands/add_sample_data.py`
   - `taps/management/commands/import_brewery_data.py`

4. **CI Integration**
   - Update GitHub Actions workflow
   - Test CI locally if possible
   - Verify type checking passes

5. **Finalization**
   - Run mypy and fix any remaining errors
   - Create commits following Conventional Commits format
   - Open PR against main branch

# Risks & Considerations

## Compatibility Risks

**Risk:** Django-stubs may not fully support all Django ORM patterns used in the codebase
**Mitigation:** Use `type: ignore` comments sparingly for unsupported patterns, document why

**Risk:** Graphene-Django type stubs may be incomplete or outdated
**Mitigation:** May need to create custom type stubs or use `cast()` for complex GraphQL types

## Development Workflow Impact

**Risk:** Strict type checking may slow down development initially
**Mitigation:** Configure mypy with gradual adoption settings (allow_untyped_calls=True initially), can tighten later

**Risk:** CI pipeline may become slower with type checking
**Mitigation:** Use mypy caching and run type checks in parallel with tests

## Breaking Changes

**Risk:** Type hints might reveal existing bugs or type inconsistencies
**Mitigation:** This is actually a benefit! Fix bugs as they're discovered, use feature branch to test thoroughly

## Learning Curve

**Risk:** Team may need to learn proper type hint syntax for Django/GraphQL
**Mitigation:** Provide examples in PR, link to django-stubs documentation, gradually adopt stricter settings

# Alternatives

## Alternative 1: Use ty instead of mypy

**Description:** Use Astral's new `ty` type checker instead of mypy

**Pros:**
- Much faster (Rust-based)
- Unified toolchain with Ruff
- Modern architecture and better error messages

**Cons:**
- Early preview stage (beta in late 2025)
- Hundreds of open issues, missing features
- Unknown Django/GraphQL support quality
- Higher risk for production CI pipeline

**Decision:** Rejected - ty is too immature for production use. Can revisit in 2026 when stable.

## Alternative 2: Gradual vs. Strict Mode

**Description:** Start with strict mode enabled immediately vs. gradual adoption

**Selected Approach:** Gradual adoption
- Start with `check_untyped_defs = false` and `allow_untyped_calls = true`
- Add type hints to all functions
- Incrementally tighten settings over time
- Avoid blocking current development velocity

**Rationale:** Entire codebase currently has only 1 type hint. Strict mode would require perfect typing immediately, which is impractical. Gradual mode allows us to add hints everywhere first, then tighten later.

## Alternative 3: Scope - Full Codebase vs. Core Only

**Description:** Type hint everything vs. just core application files

**Selected Approach:** Prioritize core files, defer configuration files
- Focus on models, schema, views, decorators (Tier 1)
- Include management commands (Tier 2)
- Defer settings.py, middleware.py, and other config files (Tier 3)

**Rationale:** Configuration files are typically less critical and more dynamic. Focus effort where type safety provides most value: business logic and API layer.
