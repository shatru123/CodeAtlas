# RepoMind — Personal Engineering Knowledge Graph

<p align="center">
  <strong>Automatically analyze, extract, and explore technical architecture, dependencies, APIs, DB flows, third-party packages, security vulnerabilities, cross-repo microservice meshes, blast radius impact, ER diagrams, container topologies, and living handbooks.</strong>
</p>

---

## 💡 What is RepoMind?

**RepoMind** is an enterprise developer tool and engineering knowledge platform that automatically analyzes local and GitHub software repositories. It parses AST code structures, maps dependency call graphs, extracts REST API routes, traces database operations, detects messaging events, indexes third-party packages, synthesizes end-to-end execution flows with **on-the-fly Mermaid diagrams**, provides an **interactive drag-and-drop React Flow canvas**, audits security/CVE vulnerabilities, calculates change blast radius, generates database ER diagrams, visualizes Docker/K8s infrastructure topology, and exports living architecture handbooks—storing everything in a centralized knowledge graph.

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

## 🚀 Enterprise v2.5 Feature Modules

### 1. 🎨 Interactive Drag-and-Drop Canvas (React Flow)
- **Drag & Drop Canvas**: Pan, zoom, and rearrange AST nodes with physics and MiniMap radar.
- **Expandable Nodes**: Double-click any component to inspect member methods, return types, attributes, and file line numbers.
- **Real-Time Path Highlighting**: Select any API route or component to highlight its exact node-to-node call chain in neon cyan while dimming unrelated nodes.
- **JSON & Canvas Export**: Export complete IR knowledge graph JSON files.

### 2. 🛡️ Security, CVE & Secret Auditing Engine
- **Package CVE Scanner**: Maps NuGet (`.csproj`), NPM (`package.json`), and PyPI (`requirements.txt`) dependencies against known CVE/NVD advisories.
- **Secret & Token Leak Detector**: Scans code for hardcoded AWS Access Keys, JWT secrets, DB passwords, RSA private keys, and GitHub PAT tokens.
- **OWASP API Auditor**: Flags unauthenticated API routes (`[AllowAnonymous]`).

### 3. 💥 Blast Radius & Change Impact Analysis Engine
- Calculates downstream impact scores (0 to 100) and risk levels (`Critical`, `High`, `Medium`, `Low`).
- Lists affected Controllers, Services, Repositories, Database operations, and Cross-Repo Mesh Services before making code changes.

### 4. 🌐 Multi-Repository Cross-Service Mesh Engine
- Connects multiple repositories into a unified workspace mesh graph.
- Links cross-repo REST HTTP API calls and MassTransit / RabbitMQ / Kafka event streams across services.

### 5. 📊 Git Branch Snapshot Diffing & Architecture Drift Inspector
- Compares AST entities, REST APIs, and new architectural violations introduced between Git branches (`main` vs `feature`).

### 6. 🗄️ Auto Database ERD (Entity-Relationship Diagram) Synthesizer
- Synthesizes dynamic Mermaid Entity-Relationship Diagrams (`erDiagram ...`) with focus table filters and scannable schema cards.

### 7. 🐳 Docker & Kubernetes Infrastructure Topology Visualizer
- Parses `Dockerfile`, `docker-compose.yml`, and K8s manifests (`deployment.yaml`, `service.yaml`) to map container services, exposed ports, and base images.

### 8. 📄 Living Architecture Handbook & Exporter
- Auto-synthesizes a comprehensive technical specification handbook with 1-click Markdown export and copy.

---

## 🏗️ Monorepo Architecture

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
    │   └── src/
    │       ├── RepoMind.Domain/         # Core IR Entities, Flow & Security Models
    │       ├── RepoMind.Application/    # ImpactEngine, ErdEngine, MeshEngine, SecurityScanner
    │       ├── RepoMind.Infrastructure/ # Roslyn C# Parser, Python & TS Parsers, InfraDetector
    │       └── RepoMind.Api/            # ASP.NET Core REST API
    └── frontend/                 # React + TypeScript + Vite Web UI
        └── src/
            ├── components/           # Graph, Flow, Security, Mesh, Impact, Diff, ERD, Infra, Handbook
            └── services/apiService.ts
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/repositories/local` | Scans a local directory path (`{"path": "~/Projects/RepoA"}`) |
| `POST` | `/api/repositories/github` | Clones & scans a GitHub repository (`{"url": "https://github.com/..."}`) |
| `GET` | `/api/repositories` | Lists all scanned repositories |
| `GET` | `/api/repositories/{id}` | Gets repository analysis summary |
| `GET` | `/api/repositories/{id}/flows` | Synthesized execution flows & Mermaid markup |
| `GET` | `/api/repositories/{id}/packages` | Third-party package dependencies (NuGet, NPM, PyPI) |
| `GET` | `/api/repositories/{id}/security` | Security CVE, hardcoded secret leaks & OWASP audit |
| `GET` | `/api/workspace/mesh` | Multi-repo cross-service dependency mesh graph |
| `GET` | `/api/repositories/{id}/impact` | Blast radius & change impact score |
| `GET` | `/api/repositories/{id}/diff` | Git branch snapshot diff & architectural drift |
| `GET` | `/api/repositories/{id}/erd` | Auto database ERD synthesis |
| `GET` | `/api/repositories/{id}/infrastructure` | Docker & K8s infrastructure topology |
| `GET` | `/api/repositories/{id}/handbook` | Living architecture handbook documentation |

---

## 🧪 Testing & Verification

```bash
# Run .NET Automated Test Suite
./.dotnet/dotnet test repomind/backend/RepoMind.sln

# Build Frontend Production Assets
cd repomind/frontend && npm run build
```

---

## 📄 License

MIT License. Built for personal engineering repository intelligence, functional flow synthesis, security auditing, and architectural knowledge exploration.
