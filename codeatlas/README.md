# RepoMind Technical Architecture & Monorepo Guide

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
      ┌──────────────────────────────────────┼──────────────────────────────────────┐
      │                                      │                                      │
┌─────▼──────────────┐             ┌─────────▼──────────┐                 ┌─────────▼──────────┐
│ Roslyn C# Parser   │             │ FlowEngine         │                 │ Package Extractor  │
│ (AST & Attributes) │             │ (Synthesizes Flows │                 │ (NuGet, NPM, PyPI) │
└─────┬──────────────┘             │  & Mermaid Markup) │                 └─────────┬──────────┘
      │                            └─────────┬──────────┘                           │
      └──────────────────────────────────────┼──────────────────────────────────────┘
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

## 🛠️ Monorepo Projects & Key Services

| Project | Responsibility | Key Components |
| :--- | :--- | :--- |
| `RepoMind.Domain` | Core IR Entities, Relationships, DTOs, Flow Models | `CodeEntity`, `CodeRelationship`, `ApiDefinition`, `FunctionalFlow`, `PackageDependency` |
| `RepoMind.Application` | Extractor pipeline abstractions & orchestrator | `RepositoryScannerService`, `FlowEngine`, `ILanguageParser`, `ITechStackDetector` |
| `RepoMind.Infrastructure` | Concrete Roslyn/Python/TS parsers, Package Extractor, Git CLI | `CSharpRoslynParser`, `PythonParser`, `TypeScriptParser`, `TechStackDetector`, `InMemoryKnowledgeStore` |
| `RepoMind.Api` | ASP.NET Core REST API & Swagger UI | `RepositoriesController`, `Program.cs` |
| `repomind/frontend` | Glassmorphic React UI for graph, flows & package exploration | `App.tsx`, `FlowExplorer.tsx`, `FlowDiagram.tsx`, `PackageExplorer.tsx`, `ArchitecturePanel.tsx` |

---

## 🧪 Verification & Unit Tests

Run test suites:
```bash
./.dotnet/dotnet test repomind/backend/RepoMind.sln
```

All domain, infrastructure, and API test suites pass cleanly.
