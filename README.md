# CodeAtlas — Personal Engineering Knowledge Graph & Intelligence Platform

<p align="center">
  <strong>Automatically analyze, extract, and explore technical architecture, dependencies, APIs, DB flows, third-party packages, security vulnerabilities, cross-repo microservice meshes, blast radius impact, ER diagrams, container topologies, live UI previews, automated test synthesis, AI code reviews, API breaking-change guards, cloud FinOps cost estimations, and living handbooks.</strong>
</p>

---

## 💡 What is CodeAtlas?

**CodeAtlas** is an enterprise-grade engineering intelligence platform that automatically analyzes software repositories. It parses AST code structures using Roslyn C#, Python, and TypeScript parsers, maps dependency call graphs, extracts REST API routes, traces database operations, detects messaging events, indexes third-party packages, synthesizes end-to-end execution flows with **on-the-fly Mermaid diagrams**, provides an **interactive drag-and-drop React Flow canvas**, audits security/CVE vulnerabilities & licenses, calculates change blast radius, generates database ER diagrams, visualizes Docker/K8s infrastructure topology, previews connected repository UI components with synthetic mock data, synthesizes automated xUnit test suites, conducts AI staff engineer code reviews, guards API contracts against breaking schema changes, estimates cloud infrastructure hosting costs, and exports living architecture handbooks—storing everything in a centralized knowledge graph.

---

## ⚡ 1-Click Launch Options

Launch both the **.NET 8 Backend API** (`http://localhost:5055`) and **React Web UI** (`http://localhost:5173`) simultaneously with a single click:

### Option 1: macOS Finder (Double-Click)
Double-click [`start.command`](file:///Users/shatrughnaambhore/Shatru/Learning/Projects/CodeAtlas/start.command) in Finder. It automatically frees bound ports (`5055`, `5173`, & `5195`), builds the backend, launches both servers, and opens [http://localhost:5173](http://localhost:5173) in your browser.

### Option 2: Terminal Script
```bash
./start.sh
```

### Option 3: NPM Command
```bash
npm start
```

---

## 🚀 Enterprise Feature Modules

### 1. 🎨 Interactive Drag-and-Drop Canvas (React Flow)
- **Drag & Drop Canvas**: Pan, zoom, and rearrange AST nodes with physics and MiniMap radar.
- **Expandable Nodes**: Double-click any component to inspect member methods, return types, attributes, and file line numbers.
- **Real-Time Path Highlighting**: Select any API route or component to highlight its exact node-to-node call chain in neon cyan while dimming unrelated nodes.

### 2. 🤖 AI Staff Engineer Code Reviewer & PR Quality Gate
- Automated staff engineer code review analyzing code readability, security risk severity, and performance bottlenecks with 1-click AI fix patches.

### 3. 🧪 Automated Test Suite Synthesizer (`Test Lab`)
- Inspects AST class definitions and synthesizes isolated unit test suites (xUnit/Moq) with mocked external dependencies (`IOrderRepository`, `IPaymentGateway`).

### 4. 🛡️ Clean Architecture Rules & Compliance Studio
- Evaluates Clean Architecture layer boundaries (e.g. *Controllers must never query DB directly*, *Domain entities must not depend on Presentation DTOs*) with compliance score ratings.

### 5. ⚡ Production Telemetry & Log Incident Studio
- Paste raw production stack traces or JSON logs to correlate errors directly with AST symbols, regressing Git commits, and 1-click AI fix patches.

### 6. 📦 Supply Chain Security & License Matrix
- Audits direct and transitive package dependencies for CVE security vulnerabilities and verifies open-source license compliance (MIT vs Apache vs copyleft GPL-3.0).

### 7. 🛡️ API Guard & Schema Breaking-Change Detector
- Compares REST/gRPC API schemas against production baselines to detect breaking contract modifications before PRs are merged.

### 8. 💰 Cloud FinOps & Infrastructure Cost Estimator
- Scans `Dockerfile`, `docker-compose.yml`, and database query frequencies to calculate monthly AWS/Azure/GCP hosting costs ($135/mo) and FinOps optimization tips.

### 9. 🌐 Live Executable REST API Playground
- In-browser HTTP client allowing developers to execute live REST API requests directly inside CodeAtlas with real-time response status, headers, and execution latency.

### 10. 🎨 Interactive Visual Architecture Canvas
- Node-based system design canvas rendering architecture connections between API Controllers, Business Logic Services, and Database Clusters.

### 11. 🖼️ Live UI Sandbox & Mock Data Previewer
- Renders actual repository frontend component code (`.tsx`, `.jsx`, `.vue`, `.html`) directly in an interactive sandbox with synthetic mock JSON data generation on the fly.

### 12. 💥 Blast Radius & Change Impact Analysis Engine
- Calculates downstream impact scores (0 to 100) and risk levels (`Critical`, `High`, `Medium`, `Low`).

### 13. 🌐 Multi-Repository Cross-Service Mesh Engine
- Connects multiple repositories into a unified workspace mesh graph.

### 14. 📊 Git Branch Snapshot Diffing & Architecture Drift Inspector
- Compares AST entities, REST APIs, and new architectural violations introduced between Git branches (`main` vs `feature`).

### 15. 🗄️ Auto Database ERD (Entity-Relationship Diagram) Synthesizer
- Synthesizes dynamic Mermaid Entity-Relationship Diagrams (`erDiagram ...`) with focus table filters and sanitized schema cards.

### 16. 🐳 Docker & Kubernetes Infrastructure Topology Visualizer
- Maps container services, exposed ports, and base images from `Dockerfile` and K8s manifests.

---

## 🏗️ Monorepo Architecture

```text
CodeAtlas/
├── start.sh                      # Single-click bash launcher script (auto port cleanup)
├── start.command                 # macOS Finder double-clickable launcher
├── package.json                  # Root npm package runner
├── README.md                     # Root documentation
└── codeatlas/
    ├── README.md                 # Technical architecture & API reference
    ├── backend/                  # .NET 8 Clean Architecture Backend
    │   ├── CodeAtlas.sln
    │   └── src/
    │       ├── CodeAtlas.Domain/         # Core IR Entities, Flow, Security, Enterprise & FinOps Models
    │       ├── CodeAtlas.Application/    # TestGenerator, ArchitectureRuleEngine, SupplyChain, Telemetry, FinOps, ApiGuard
    │       ├── CodeAtlas.Infrastructure/ # Roslyn C# Parser, Python & TS Parsers, InfraDetector
    │       └── CodeAtlas.Api/            # ASP.NET Core REST API
    └── frontend/                 # React + TypeScript + Vite Web UI
        └── src/
            ├── components/           # 25+ Enterprise Engineering Panels (Graph, TestLab, FinOps, ApiGuard, UI Sandbox, etc.)
            └── services/apiService.ts
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/repositories/local` | Scans a local directory path (`{"path": "~/Projects/RepoA"}`) |
| `POST` | `/api/repositories/github` | Clones & scans a GitHub repository (`{"url": "https://github.com/..."}`) |
| `GET` | `/api/testlab/{id}` | Synthesizes automated xUnit/Moq unit tests for uncovered AST classes |
| `GET` | `/api/architecturerules/{id}` | Evaluates Clean Architecture rules & layer compliance |
| `GET` | `/api/supplychain/{id}` | Audits package CVE vulnerabilities & license compliance |
| `POST` | `/api/telemetry/{id}/parse-log` | Correlates raw stack trace with AST symbols & commit blame |
| `GET` | `/api/codereview/{id}` | Staff engineer AI code review report |
| `GET` | `/api/apiguard/{id}` | API breaking change detector & schema diffs |
| `GET` | `/api/finops/{id}` | Cloud infrastructure monthly hosting bill estimator |
| `POST` | `/api/playground/execute` | Live in-browser HTTP REST API request client |
| `GET` | `/api/visualarch/{id}` | Interactive visual system design architecture nodes |
| `GET` | `/api/uipreview/{id}/components` | Live UI Sandbox component blueprints & actual FE code |
| `GET` | `/api/analytics/dashboard` | Unique visitor geolocation & IP analytics (`PIN: shatru2026`) |

---

## 🧪 Testing & Verification

```bash
# Run .NET Automated Test Suite
./.dotnet/dotnet test codeatlas/backend/CodeAtlas.sln

# Build Frontend Production Assets
cd codeatlas/frontend && npm run build
```

---

## 📄 License

MIT License. Designed and built by **Shatrughna Ambhore** for personal engineering repository intelligence, functional flow synthesis, security auditing, and architectural knowledge exploration.
