# RepoMind — Personal Engineering Knowledge Graph

**RepoMind** is a developer tool that automatically analyzes and extracts technical knowledge from software repositories, storing code constructs, AST relationships, APIs, database operations, messaging events, tech stacks, and Git metadata in a centralized knowledge base.

---

## Architecture (Phase 1 — .NET 8 Clean Architecture)

RepoMind's backend is built with **.NET 8** following **Clean Architecture** principles:

```text
repomind/
└── backend/
    ├── src/
    │   ├── RepoMind.Domain/          # Core IR Entities, Relationships, DTOs, Enums
    │   ├── RepoMind.Application/     # Scanner Service, ILanguageParser, Pipeline Abstractions
    │   ├── RepoMind.Infrastructure/  # Roslyn C# AST Parser, TechStackDetector, GitExtractor, Store
    │   └── RepoMind.Api/             # ASP.NET Core Web API Controllers & Swagger UI
    └── tests/
        ├── RepoMind.Domain.Tests/
        ├── RepoMind.Infrastructure.Tests/
        └── RepoMind.Api.Tests/
```

---

## Key Extracted Constructs

### 1. Code Entities (AST Nodes)
* `Class`, `Interface`, `Struct`, `Enum`, `Record`
* `Method`, `Property`, `Field`
* `Controller`, `Service`, `Repository`, `DTO`, `Model`, `Consumer`

### 2. Directed Code Relationships (Knowledge Graph Edges)
* `Contains` (Class -> Method)
* `Inherits` / `Implements` (Class -> Interface/Base)
* `DependsOn` (Constructor Injection)
* `Calls` (Method -> Method Invocation)
* `Publishes` / `Consumes` (MassTransit / RabbitMQ events)
* `ReadsFrom` / `WritesTo` (EF Core / Dapper DB queries)

### 3. API & Infrastructure Mapping
* ASP.NET Core REST API routes (`[HttpGet]`, `[HttpPost]`, `[Route]`)
* EF Core ORM mappings & DbSet references
* MassTransit / RabbitMQ Event publishing and consumer handlers
* Multi-language detection (`C#`, `Python`, `TypeScript`, `Node.js`, `Docker`, `Terraform`)

---

## API Endpoints

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/repositories/scan` | Triggers a scan on a local repository path |
| `GET` | `/api/repositories` | Lists all registered repositories |
| `GET` | `/api/repositories/{id}` | Gets repository analysis summary |
| `GET` | `/api/repositories/{id}/entities` | Filterable AST code entities (Classes, Interfaces, Methods) |
| `GET` | `/api/repositories/{id}/relationships` | Dependency graph edges (`CALLS`, `INHERITS`, `DEPENDS_ON`) |
| `GET` | `/api/repositories/{id}/apis` | Extracted REST API routes and endpoints |
| `GET` | `/api/repositories/{id}/databases` | Database tables & ORM queries |
| `GET` | `/api/repositories/{id}/events` | Published and consumed messaging events |
| `GET` | `/api/repositories/{id}/architecture` | Architecture pattern summary & pattern violations |
| `GET` | `/api/repositories/{id}/technologies` | Detected tech stack & languages |

---

## Running & Testing

### Build Solution
```bash
./.dotnet/dotnet build repomind/backend/RepoMind.sln
```

### Run Tests
```bash
./.dotnet/dotnet test repomind/backend/RepoMind.sln
```

### Launch API
```bash
./.dotnet/dotnet run --project repomind/backend/src/RepoMind.Api
```

Swagger UI will be accessible at: `http://localhost:5000/swagger`
