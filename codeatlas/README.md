# CodeAtlas Technical Architecture & Monorepo Guide

This directory contains the core implementation of **CodeAtlas — Personal Engineering Knowledge Graph**.

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
| `CodeAtlas.Domain` | Core IR Entities, Relationships, DTOs, Flow Models | `CodeEntity`, `CodeRelationship`, `ApiDefinition`, `FunctionalFlow`, `PackageDependency` |
| `CodeAtlas.Application` | Extractor pipeline abstractions & orchestrator | `RepositoryScannerService`, `FlowEngine`, `ILanguageParser`, `ITechStackDetector` |
| `CodeAtlas.Infrastructure` | Concrete Roslyn/Python/TS parsers, Package Extractor, Git CLI | `CSharpRoslynParser`, `PythonParser`, `TypeScriptParser`, `TechStackDetector`, `InMemoryKnowledgeStore` |
| `CodeAtlas.Api` | ASP.NET Core REST API & Swagger UI | `RepositoriesController`, `Program.cs` |
| `codeatlas/frontend` | Glassmorphic React UI for graph, flows & package exploration | `App.tsx`, `FlowExplorer.tsx`, `FlowDiagram.tsx`, `PackageExplorer.tsx`, `ArchitecturePanel.tsx` |

---

## 🧪 Verification & Unit Tests

Run test suites:
```bash
./.dotnet/dotnet test codeatlas/backend/CodeAtlas.sln
```

All domain, infrastructure, and API test suites pass cleanly.
