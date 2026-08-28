# CODEATLAS 3.0 ARCHITECTURE SPECIFICATION
## AI Engineering Intelligence & Autonomous Software Engineering Platform

---

## 1. Executive Overview

CodeAtlas 3.0 transforms CodeAtlas into an enterprise-grade AI Engineering Intelligence & Autonomous Software Engineering Platform. It bridges static code understanding, runtime telemetry, version control history, and autonomous LLM coding agents into a unified, evidence-based engineering system.

### Core Value Proposition:
> **Understand → Investigate → Predict → Change → Verify → Deliver**

CodeAtlas understands your entire software ecosystem, explains architecture with concrete code evidence, predicts change impact (Blast Radius), investigates production regressions, safely modifies code inside isolated Docker sandboxes using tool-driven AI agents, and creates reviewable Git Pull Requests.

---

## 2. System Architecture & Layer Boundaries (.NET 10 Clean Architecture)

The CodeAtlas backend is structured around a **.NET 10 Clean Architecture** with strict layer separation and explicit interface contracts:

```
                                 ┌─────────────────────────────────────────┐
                                 │       React + TypeScript + Vite UI      │
                                 │     Monaco Editor + SignalR Client      │
                                 └────────────────────┬────────────────────┘
                                                      │ REST API & SignalR WebSockets
                                                      ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CodeAtlas.Api (ASP.NET Core Web API / SignalR Hubs / Swagger / Middleware)                            │
└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                    │
┌───────────────────────────────────────────────────▼────────────────────────────────────────────────────┐
│ CodeAtlas.Application                                                                                  │
│  - System Explorer & Flow Engine              - AI Context & Search Engine                             │
│  - Agent Orchestration Services               - Engineering Health Calculators                         │
└──────────────────┬────────────────────────────────┬────────────────────────────────┬───────────────────┘
                   │                                │                                │
                   ▼                                ▼                                ▼
┌──────────────────┴─────────────┐ ┌────────────────┴─────────────┐ ┌────────────────┴──────────────────┐
│ CodeAtlas.KnowledgeGraph       │ │ CodeAtlas.Agent             │ │ CodeAtlas.RuntimeIntelligence    │
│  - Unified System Graph        │ │  - Dynamic Tool Registry    │ │  - OpenTelemetry Collector       │
│  - Roslyn C# Parser & AST      │ │  - Autonomous Agent Loop    │ │  - Log/Trace/Metric Correlator   │
│  - Multi-Lang AST Parsers      │ │  - Human Approval Gates     │ │  - Incident & RCA Engine         │
└──────────────────┬─────────────┘ └────────────────┬─────────────┘ └────────────────┬──────────────────┘
                   │                                │                                │
                   └────────────────────────────────┼────────────────────────────────┘
                                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CodeAtlas.Infrastructure                                                                               │
│  - Entity Framework Core (PostgreSQL)          - Redis Distributed Cache & Pub/Sub                     │
│  - Docker Sandbox Execution Engine             - LibGit2Sharp / Git CLI Providers                      │
│  - Background Worker Queues (Task Engine)      - LLM Provider Adapters (Gemini / OpenAI / Claude)      │
└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CodeAtlas.Domain                                                                                       │
│  - Graph Entities, Agent Task State Machine, Evidence Models, Telemetry Schemas, Policy Definitions     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Intermediate Representation (IR) & Parsing Pipeline

CodeAtlas analyzes codebases by transforming raw source files into a language-agnostic Intermediate Representation (IR):

```
Source Files (.cs, .ts, .py, .java, .go)
           ↓
Language Parser (Roslyn for C#, AST Parsers for Multi-Lang)
           ↓
Unified Intermediate Representation (IR)
           ↓
Semantic Model & Symbol Resolution
           ↓
Engineering Knowledge Graph (Nodes, Relationships & Evidence)
           ↓
AI Context Engine (RAG Vector Store & Context Window Builder)
```

### Key Components:
- **Roslyn Integration**: Deepest AST traversal for C# / .NET 10 solutions, resolving exact type declarations, invocation sites, dependency injection bindings, and EF Core entity mappings.
- **Multi-Language AST Engine**: Pluggable `ILanguageParser` implementations for TypeScript, JavaScript, Python, Java, and Go.
- **Evidence Linking**: Every node and edge in the graph maps directly to an immutable source location (`FilePath`, `StartLine`, `EndLine`, `SymbolHash`).

---

## 4. Persistent Agent Execution Architecture

Autonomous agent tasks execute outside the HTTP request lifecycle in background worker queues, persisted to PostgreSQL and streamed to clients via SignalR:

```
HTTP Request / CLI / Schedule
          ↓
[Enqueues Task] → PostgreSQL (AgentTask Table) + Redis Queue
                          ↓
                .NET Background Worker (AgentTaskWorkerService)
                          ↓
                Ephemeral Workspace Provisioner (/workspaces/{taskId})
                          ↓
                Docker Sandbox Container Creation
                          ↓
                Dynamic LLM Agent Loop (Tool Choice → Execution → Verification)
                          ↓
                SignalR Real-Time Stream → React UI Timeline
```

---

## 5. Deployment Topology

CodeAtlas 3.0 deploys as containerized microservices:
1. **`codeatlas-api`**: ASP.NET Core 10 Web API and SignalR WebSockets gateway.
2. **`codeatlas-worker`**: .NET Worker Service running long-running agent tasks and background indexing jobs.
3. **`codeatlas-db`**: PostgreSQL 16 database storing persistent workspace graphs, agent timelines, and telemetry logs.
4. **`codeatlas-redis`**: Redis 7 instance managing task queues, pub/sub notifications, and symbol caching.
5. **`codeatlas-sandbox`**: Isolated Docker daemon executing untrusted agent code builds and unit test suites.
6. **`codeatlas-ui`**: React 18 TypeScript SPA served via NGINX or static CDN.
