# RepoMind — Personal Engineering Knowledge Graph

**RepoMind** is a personal engineering knowledge platform that automatically analyzes software repositories (local and GitHub), extracts technical entities, dependencies, APIs, DB flows, architecture patterns, and messaging events, and stores them in a knowledge base for developer query and exploration.

---

## Quick Start (Phase 1 Backend)

### Solution Location
```text
repomind/backend/RepoMind.sln
```

### Build & Run Tests
```bash
./.dotnet/dotnet build repomind/backend/RepoMind.sln
./.dotnet/dotnet test repomind/backend/RepoMind.sln
```

### Start Web API
```bash
./.dotnet/dotnet run --project repomind/backend/src/RepoMind.Api
```

Swagger UI will open at `http://localhost:5000/swagger`.

For detailed architecture docs and API reference, see [repomind/README.md](file:///Users/shatrughnaambhore/Shatru/Learning/Projects/CodeAtlas/repomind/README.md).
