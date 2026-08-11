# RepoMind — Personal Engineering Knowledge Graph

<p align="center">
  <strong>Automatically analyze, extract, and explore technical architecture, dependencies, APIs, DB flows, third-party packages, and messaging events from software repositories with on-the-fly Mermaid flowcharts.</strong>
</p>

---

## 💡 What is RepoMind?

**RepoMind** is a developer tool and engineering knowledge platform that automatically analyzes local and GitHub software repositories. It parses AST code structures, maps dependency call graphs, extracts REST API routes, traces database operations, detects messaging events, indexes third-party packages, synthesizes end-to-end execution flows with **on-the-fly Mermaid diagrams**, and flags architectural layer violations—storing everything in a centralized knowledge graph.

Instead of searching through dozens of repositories manually, **RepoMind** extracts structured technical intelligence so you can answer:
* **Functional Flows**: What is the complete execution path when an API request or event is triggered? *(Rendered as interactive Mermaid sequence flowcharts)*
* **Architecture & Rules**: What structural pattern is used? Are controllers accessing database tables directly, bypassing the service layer?
* **APIs**: Which REST endpoints are exposed, and which controllers handle them?
* **Package Dependencies**: Which third-party NuGet, NPM, or PyPI packages are imported, and what versions are used?
* **Database Operations**: Which database tables and ORM mappings (EF Core, Dapper, SQLAlchemy) are involved in a flow?
* **Messaging & Events**: Which services publish or consume events via MassTransit, RabbitMQ, or Kafka?

---

## ⚡ 1-Click Launch Options

Launch both the **.NET 8 Backend API** (`http://localhost:5055`) and **React Web UI** (`http://localhost:5173`) simultaneously with a single click:

### Option 1: macOS Finder (Double-Click)
Double-click [`start.command`](file:///Users/shatrughnaambhore/Shatru/Learning/Projects/CodeAtlas/start.command) in Finder. It automatically frees bound ports (`5055` & `5173`), builds the backend, launches both servers, and opens [http://localhost:5173](http://localhost:5173) in your browser.

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
├── start.sh                      # Single-click bash launcher script (auto port cleanup)
├── start.command                 # macOS Finder double-clickable launcher
├── package.json                  # Root npm package runner
├── README.md                     # Root documentation
└── repomind/
    ├── README.md                 # Technical architecture & API reference
    ├── backend/                  # .NET 8 Clean Architecture Backend
    │   ├── RepoMind.sln
    │   ├── src/
    │   │   ├── RepoMind.Domain/         # Core IR Entities, Flow Models & Enums
    │   │   ├── RepoMind.Application/    # Extractor Pipeline & FlowEngine
    │   │   ├── RepoMind.Infrastructure/ # Roslyn C# Parser, Python & TS Parsers, Package Extractor
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
            └── components/           # Knowledge Graph, Flow Diagrams, API, DB & Package Explorers
```

### Stack Summary
* **Backend**: .NET 8 (C#), ASP.NET Core Web API, Microsoft Roslyn AST Parser (`Microsoft.CodeAnalysis.CSharp`), Swagger UI.
* **Frontend**: React 18, TypeScript, Vite 5, Mermaid.js (SVG sequence flowcharts rendered on the fly), Glassmorphic Vanilla CSS Design System, Lucide Icons.
* **Multi-Language Support**: C#, Python, TypeScript/JavaScript, Java, Go, SQL.

---

## 🔍 Core Capabilities & Features

### 1. Repository Source Integration
* **Local Repositories**: Scans local directories with full tilde (`~`) expansion support (e.g. `~/Projects/OrderService`).
* **GitHub Repositories**: Clones & scans public or private GitHub repositories (`https://github.com/owner/repo.git`), supporting branch selection, commit SHA, and OAuth/PAT access tokens.

### 2. Multi-Language AST Code Extraction
* **Constructs**: `Class`, `Interface`, `Struct`, `Enum`, `Record`, `Method`, `Controller`, `Service`, `Repository`, `DTO`, `Consumer`.
* **Directed Edges**: `Contains`, `Calls`, `Inherits`, `Implements`, `DependsOn`, `ReadsFrom`, `WritesTo`, `Publishes`, `Consumes`.

### 3. End-to-End Functional Flows & On-the-Fly Mermaid Diagrams
* Synthesizes execution paths starting from API endpoints down to Controllers, Services, Repositories, Database operations, and Event messaging.
* Dynamically renders **Mermaid sequence flowchart diagrams** (`graph TD ...`) with zoom controls, fullscreen mode, and 1-click Mermaid code copying.

### 4. Third-Party Package & Library Dependency Indexing
* Parses and indexes external dependencies across **NuGet** (`.csproj`), **NPM** (`package.json`), and **PyPI** (`requirements.txt`).
* Displays package names, versions, ecosystems, and file locations.

### 5. Architectural Pattern Detection & Evaluated Rules Checklist
* Evaluates 4 core architectural compliance rules:
  1. *Layered Architectural Isolation* (Controllers -> Services -> Repositories)
  2. *No Direct Controller DB Access* (Flags controllers accessing raw SQL/ORM tables directly)
  3. *Decoupled Interface Abstractions*
  4. *Asynchronous Event Broker Decoupling*
* Displays a detailed collapsible list of violation alerts with file line numbers.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/repositories/local` | Scans a local directory path (`{"path": "~/Projects/RepoA"}`) |
| `POST` | `/api/repositories/github` | Clones & scans a GitHub repository (`{"url": "https://github.com/..."}`) |
| `POST` | `/api/repositories/scan` | Universal scan endpoint (Local or GitHub) |
| `GET` | `/api/repositories` | Lists all scanned repositories |
| `GET` | `/api/repositories/{id}` | Gets repository analysis summary |
| `GET` | `/api/repositories/{id}/entities` | Filterable AST code entities |
| `GET` | `/api/repositories/{id}/relationships` | Dependency & call graph edges |
| `GET` | `/api/repositories/{id}/flows` | Synthesized execution flows & Mermaid markup |
| `GET` | `/api/repositories/{id}/packages` | Third-party package dependencies (NuGet, NPM, PyPI) |
| `GET` | `/api/repositories/{id}/apis` | Extracted REST API endpoints |
| `GET` | `/api/repositories/{id}/databases` | Database tables & ORM queries |
| `GET` | `/api/repositories/{id}/events` | Published and consumed events |
| `GET` | `/api/repositories/{id}/architecture` | Layer pattern & architectural violation alerts |
| `GET` | `/api/repositories/{id}/technologies` | Detected tech stack & languages |

---

## 🧪 Testing & Verification

### Run .NET Automated Test Suite
```bash
./.dotnet/dotnet test repomind/backend/RepoMind.sln
```

### Build Frontend Production Assets
```bash
cd repomind/frontend
npm run build
```

---

## 📄 License

MIT License. Built for personal engineering repository intelligence, functional flow synthesis, and architectural knowledge exploration.
