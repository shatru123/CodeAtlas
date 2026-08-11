# RepoMind — Personal Engineering Knowledge Graph

<p align="center">
  <strong>Automatically analyze, extract, and explore technical architecture, dependencies, APIs, DB flows, and messaging events from software repositories.</strong>
</p>

---

## 💡 What is RepoMind?

**RepoMind** is a developer tool and knowledge platform that automatically analyzes local and GitHub software repositories. It parses AST code structures, maps dependency call graphs, extracts REST API routes, traces database operations, detects messaging events, and flags architectural layer violations—storing everything in a centralized knowledge graph.

Instead of searching through dozens of repositories manually, **RepoMind** extracts structured technical intelligence so you can understand:
* **Architecture**: What is the structural pattern of this repository? (Clean Architecture, Monolith, CQRS).
* **APIs**: Which REST endpoints are exposed, and which controllers handle them?
* **Dependencies**: Which services call which repositories or external interfaces?
* **Database Operations**: Which database tables and ORM mappings (EF Core, Dapper, SQLAlchemy) are involved in a flow?
* **Messaging & Events**: Which services publish or consume events via MassTransit, RabbitMQ, or Kafka?
* **Violations**: Are controllers accessing database tables directly, bypassing the service layer?

---

## ⚡ 1-Click Launch Options

You can launch both the **.NET 8 Backend API** (`http://localhost:5055`) and **React Web UI** (`http://localhost:5173`) simultaneously with a single click:

### Option 1: macOS Finder (Double-Click)
Double-click [`start.command`](file:///Users/shatrughnaambhore/Shatru/Learning/Projects/CodeAtlas/start.command) in Finder. It will build the backend, launch both servers, and open [http://localhost:5173](http://localhost:5173) in your browser.

### Option 2: Terminal Script
```bash
./start.sh
```

### Option 3: NPM Command
```bash
npm start
```

---

## 🏗️ Architecture & Technology Stack

RepoMind follows **Clean Architecture** principles in a clean monorepo:

```text
CodeAtlas/
├── start.sh                      # Single-click bash launcher script
├── start.command                 # macOS Finder launcher script
├── package.json                  # Root npm package runner
├── README.md                     # Root documentation
└── repomind/
    ├── README.md                 # Technical architecture & API reference
    ├── backend/                  # .NET 8 Clean Architecture Backend
    │   ├── RepoMind.sln
    │   ├── src/
    │   │   ├── RepoMind.Domain/         # Core IR Entities, Value Objects & Enums
    │   │   ├── RepoMind.Application/    # Extractor Pipeline & Abstractions
    │   │   ├── RepoMind.Infrastructure/ # Roslyn C# Parser, Python & TS Parsers, Git CLI
    │   │   └── RepoMind.Api/            # ASP.NET Core REST API & Swagger UI
    │   └── tests/
    │       ├── RepoMind.Domain.Tests/
    │       ├── RepoMind.Infrastructure.Tests/
    │       └── RepoMind.Api.Tests/
    └── frontend/                 # React + TypeScript + Vite Web UI
        ├── index.html
        ├── package.json
        ├── vite.config.ts
        └── src/
            ├── index.css             # Glassmorphic Dark Design System
            ├── App.tsx               # Main Workspace & Tabs
            ├── services/apiService.ts
            └── components/           # Knowledge Graph, API, DB & Architecture Views
```

### Stack Summary
* **Backend**: .NET 8 (C#), ASP.NET Core Web API, Microsoft Roslyn AST Parser (`Microsoft.CodeAnalysis.CSharp`), Swagger UI.
* **Frontend**: React 18, TypeScript, Vite 5, Glassmorphic Vanilla CSS Design System, Lucide Icons.
* **Multi-Language Support**: C#, Python, TypeScript/JavaScript, Java, Go, SQL.

---

## 🔍 Core Capabilities & Features

### 1. Repository Source Integration
* **Local Repositories**: Scans local directories with full tilde (`~`) expansion support (e.g. `~/Projects/OrderService`).
* **GitHub Repositories**: Clones & scans public or private GitHub repositories (`https://github.com/owner/repo.git` or `git@github.com:...`), supporting specific branch, commit SHA, and OAuth/PAT access tokens.

### 2. Multi-Language AST Code Extraction
* **Constructs**: `Class`, `Interface`, `Struct`, `Enum`, `Record`, `Method`, `Controller`, `Service`, `Repository`, `DTO`, `Consumer`.
* **Directed Edges**: `Contains`, `Calls`, `Inherits`, `Implements`, `DependsOn`, `ReadsFrom`, `WritesTo`, `Publishes`, `Consumes`.

### 3. REST API Endpoint Mapping
* Extracts ASP.NET Core, FastAPI, Flask, Express, and NestJS API routes (`[HttpGet]`, `[HttpPost]`, `@app.get(...)`, `@Get(...)`).
* Displays HTTP method badges, route strings, controller/action handlers, and file line numbers.

### 4. Database & ORM Flow Discovery
* Extracts EF Core `DbContext`/`DbSet<T>` mappings, Dapper raw SQL queries, and SQLAlchemy models.
* Categorizes operations into `READ`, `WRITE`, and `CREATE TABLE`.

### 5. Messaging & Event Broker Extraction
* Extracts MassTransit, RabbitMQ, and Kafka event publishing (`Publish<T>`, `Send<T>`) and event consumers (`IConsumer<T>`).

### 6. Architectural Pattern & Violation Flags
* Detects structural patterns (Clean Architecture, Monolith, Layered).
* Automatically alerts when controllers access database tables directly bypassing the service layer.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Sample Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/repositories/local` | Scans a local directory path | `{"path": "~/Projects/RepoA"}` |
| `POST` | `/api/repositories/github` | Clones & scans a GitHub repository | `{"url": "https://github.com/owner/repo.git", "branch": "main"}` |
| `POST` | `/api/repositories/scan` | Universal scan endpoint (Local or GitHub) | `{"path": "~/Projects/RepoA"}` or `{"url": "https://github.com/..."}` |
| `GET` | `/api/repositories` | Lists all scanned repositories | — |
| `GET` | `/api/repositories/{id}` | Gets repository analysis summary | — |
| `GET` | `/api/repositories/{id}/entities` | Filterable AST code entities | Query: `?type=Controller` |
| `GET` | `/api/repositories/{id}/relationships` | Dependency & call graph edges | Query: `?type=Calls` |
| `GET` | `/api/repositories/{id}/apis` | Extracted REST API endpoints | — |
| `GET` | `/api/repositories/{id}/databases` | Database tables & ORM queries | — |
| `GET` | `/api/repositories/{id}/events` | Published and consumed events | — |
| `GET` | `/api/repositories/{id}/architecture` | Layer pattern & architectural violations | — |
| `GET` | `/api/repositories/{id}/technologies` | Detected tech stack & languages | — |

---

## 🧪 Testing & Verification

### Run .NET Automated Tests
```bash
./.dotnet/dotnet test repomind/backend/RepoMind.sln
```

### Build Frontend Production Bundle
```bash
cd repomind/frontend
npm run build
```

---

## 📄 License

MIT License. Built for personal engineering repository intelligence and knowledge graph exploration.
