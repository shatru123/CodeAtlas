# CODEATLAS 3.0 ROADMAP & PHASE SPECIFICATION

---

## Overview

This roadmap defines the implementation sequence for transforming CodeAtlas into a full AI Engineering Intelligence & Autonomous Software Engineering Platform.

```
PHASE 0 ──► PHASE 1 ──► PHASE 2 ──► PHASE 3 ──► PHASE 4 ──► PHASE 5 ──► PHASE 6 ──► PHASE 7 ──► PHASE 8
 Audit     Foundation   Understand    Real Agent   Coder Agent Investigate   Health       Ecosystem   Enterprise
```

---

## Phase Breakdown

### Phase 0: Audit & Architecture Documentation (COMPLETED)
- Full inspection of backend, frontend, parsers, scanners, and models.
- Creation of 6 core architecture documentation specifications in `docs/`.
- Implementation planning and verification strategy.

### Phase 1: Foundation (.NET 10, Persistence & Task Engine)
- **Domain & Persistence**: Entity Framework Core + PostgreSQL schema migrations for `Organization`, `Repository`, `GraphNode`, `GraphRelationship`, `AgentTask`, `AgentStep`, `AgentToolCall`, `Evidence`, `Artifact`.
- **Async Execution Store**: Redis task queues + Background Worker Services for asynchronous agent processing.
- **SignalR Real-Time Hub**: `AgentHub` streaming execution logs, timelines, and status updates to React UI.
- **Docker Sandbox Execution**: Ephemeral containerized sandbox manager with memory, CPU, timeout, and network isolation limits.
- **Design System & Shell**: Dark-first IDE shell layout with resizable split-panes, top bar navigation (Understand, Build, Investigate, Architecture, Engineering Health), and Command Palette (`⌘K`).

### Phase 2: System Explorer & Universal Knowledge Graph
- **Universal Search**: Integrated multi-modal search engine indexing AST symbols, REST routes, SQL tables, events, and Git commits.
- **Interactive Knowledge Graph**: Graph Explorer supporting zoom, pan, node grouping, path finding, and contextual evidence inspector.
- **Traceability & Evidence**: Direct file/line linking with confidence scores and symbol cross-referencing.
- **Unified Flow & System Mapping**: Interactive call graphs, sequence diagrams, and cross-repository call mapping.

### Phase 3: Dynamic Tool-Driven AI Agent Engine
- **Tool Abstraction & Registry**: Implementation of `IAgent`, `IAgentOrchestrator`, `IAgentTool`, `IAgentToolRegistry`, `IAgentPlanner`, `IAgentValidator`, `IAgentWorkspace`, `IAgentSandbox`, `IAgentExecutionStore`, `ILLMProvider`.
- **30+ Agent Tools**: Code search, symbol resolution, AST inspection, impact calculation, file read/write, Git operations, build & test execution, security scanning.
- **LLM Abstraction**: Pluggable provider system (Gemini, OpenAI, Anthropic) supporting tool invocation JSON schemas.
- **Human Approval Gates**: Configurable approval policies for file deletion, DB schema changes, remote pushes, and PR creation.
- **Agent Task Center**: Real-time interactive timeline showing tool calls, evidence, files touched, and execution duration.

### Phase 4: Autonomous Coding & Refactoring Agent
- **End-to-End Coding Workflow**: Requirement → Impact Analysis → Plan → Code Generation → Docker Build → Test Suite → Security Scan → Arch Check → Git Branch → PR Creation.
- **Bug Fix Agent**: Diagnostic loop capturing test failure output, tracing call stacks, locating regressions, and applying fixes.
- **Refactoring & Migration Agent**: Automated upgrading of framework patterns (.NET 8/10, System.Text.Json, Minimal APIs, package upgrades).
- **Git Branch & PR Generator**: Automated creation of dedicated git branches (`codeatlas/agent/task-...`) and reviewable Pull Requests.

### Phase 5: Runtime Intelligence & Root Cause Analysis
- **Observability Providers**: OpenTelemetry, Prometheus, Splunk, Grafana, and Azure Monitor provider adapters.
- **Static + Runtime Graph Overlay**: Overlaying real-time p95 latency, error rates, and request throughput on static code nodes.
- **Root Cause Analysis (RCA) Agent**: Autonomous investigation correlating production error spikes and traces back to exact Git commits and code changes.

### Phase 6: Unified Engineering Health Dashboard
- **7 Health Pillars**: Architecture (82), Security (91), Dependencies (76), Testing (68), Observability (54), Documentation (43), Complexity (71).
- **Prioritized Technical Debt Engine**: Calculating `Impact × Risk × Usage × Change Frequency` to prioritize refactoring candidates.
- **One-Click Agent Remediation**: "Fix with Agent" button triggering immediate autonomous fixes inside sandbox.

### Phase 7: Developer Ecosystem (CLI, NuGet & MCP)
- **CodeAtlas CLI**: `codeatlas init`, `codeatlas analyze`, `codeatlas ask`, `codeatlas trace`, `codeatlas impact`, `codeatlas agent`.
- **NuGet Packages**: `CodeAtlas.Architecture`, `CodeAtlas.ApiGuard`, `CodeAtlas.DependencyAnalysis`.
- **Model Context Protocol (MCP)**: Server exposing CodeAtlas tool definitions to external AI clients (Claude Desktop, Antigravity IDE).

### Phase 8: Multi-Repository Enterprise Suite
- **Multi-Tenant Organizations**: Team permissions, multi-repo workspaces, cross-repository dependency graphs.
- **Policy Enforcement & Audit Logs**: Centralized compliance rules, security audit trails, and CI/CD pipeline integration.
