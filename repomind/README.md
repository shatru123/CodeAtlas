# RepoMind Technical Specification & Architecture

This directory contains the core implementation of **RepoMind — Personal Engineering Knowledge Graph**.

---

## 🏛️ System Architecture

```text
                               ┌───────────────────────────┐
                               │     React Web UI          │
                               │   (http://localhost:5173) │
                               └─────────────┬─────────────┘
                                             │ HTTP REST API
                               ┌─────────────▼─────────────┐
                               │   ASP.NET Core Web API    │
                               │   (http://localhost:5055) │
                               └─────────────┬─────────────┘
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               │                             │                             │
    ┌──────────▼──────────┐       ┌──────────▼──────────┐       ┌──────────▼──────────┐
    │ Roslyn C# Parser    │       │ Python AST Parser   │       │ TypeScript Parser   │
    │ (Roslyn SyntaxTree) │       │ (Functions, Routes) │       │ (TS/JS Classes/APIs)│
    └──────────┬──────────┘       └──────────┬──────────┘       └──────────┬──────────┘
               │                             │                             │
               └─────────────────────────────┼─────────────────────────────┘
                                             │
                               ┌─────────────▼─────────────┐
                               │  Intermediate Representation │
                               │  (CodeEntity & Relationships)│
                               └─────────────┬─────────────┘
                                             │
                               ┌─────────────▼─────────────┐
                               │ In-Memory Knowledge Store │
                               └───────────────────────────┘
```

---

## 🛠️ Monorepo Projects

| Project | Responsibility | Key Classes |
| :--- | :--- | :--- |
| `RepoMind.Domain` | Core Entities, Relationships, DTOs, Enums | `CodeEntity`, `CodeRelationship`, `ApiDefinition`, `DatabaseReference`, `EventDefinition` |
| `RepoMind.Application` | Extractor pipeline abstractions & orchestrator | `RepositoryScannerService`, `ILanguageParser`, `ITechStackDetector`, `IGitMetadataExtractor` |
| `RepoMind.Infrastructure` | Concrete Roslyn/Python/TS parsers, Git CLI & Persistence | `CSharpRoslynParser`, `PythonParser`, `TypeScriptParser`, `GitMetadataExtractor`, `InMemoryKnowledgeStore` |
| `RepoMind.Api` | ASP.NET Core REST API & Swagger UI | `RepositoriesController`, `Program.cs` |
| `repomind/frontend` | Glassmorphic React UI for graph & API exploration | `App.tsx`, `GraphExplorer.tsx`, `ApiExplorer.tsx`, `DatabaseExplorer.tsx` |

---

## 🚀 Single-Click Launch Script Mechanics

The `./start.sh` script handles:
1. Setting `.dotnet` SDK environment variables.
2. Compiling `RepoMind.Api.csproj` to binary.
3. Launching backend API process on background port `5055`.
4. Launching Vite dev server on background port `5173`.
5. Opening [http://localhost:5173](http://localhost:5173) in browser.
6. Trapping process kill signals (`INT`, `TERM`, `EXIT`) to shut down both processes cleanly on exit.

---

## 🧪 Verification & Unit Tests

Run test suites:
```bash
./.dotnet/dotnet test repomind/backend/RepoMind.sln
```

All domain, infrastructure, and API test suites pass cleanly.
