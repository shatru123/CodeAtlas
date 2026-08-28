# CODEATLAS 3.0 UI ARCHITECTURE & PRODUCT INFORMATION ARCHITECTURE

---

## 1. Top-Level Product Information Architecture

CodeAtlas 3.0 organizes the workspace into **Five Primary Engineering Pillars**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│   UNDERSTAND   │   BUILD   │   INVESTIGATE   │   ARCHITECTURE   │   ENGINEERING HEALTH  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **UNDERSTAND**: Universal System Explorer, Knowledge Graph, Code & Symbol Search, REST API Catalog, Database & ORM Explorer, Messaging Events, Functional Flows, Infrastructure Topology.
2. **BUILD**: Autonomous AI Coding Agent, Agent Task Center, Refactoring Bot, Migration Assistant, Test Generator, Git Branch & PR Workflow.
3. **INVESTIGATE**: Root Cause Analysis (RCA) Engine, Incident & Trace Correlator, OpenTelemetry APM Metrics, Log Viewer, Performance Regressions, Git Commit Correlation.
4. **ARCHITECTURE**: Architecture Graph, Dependency Matrix, API Topology, DB ERD, Infrastructure Map, Architecture Rules & Violation Alerts.
5. **ENGINEERING HEALTH**: Security CVE Audit, Technical Debt Prioritization Matrix, Observability Health, Dependency Vulnerabilities, Health Score Radar.

---

## 2. Main Application Shell Design Layout

Dark-first, high-density IDE shell layout with resizable split-panes:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🚀 CodeAtlas 3.0    🔍 Search & Command Palette (⌘K)            🔔 Notifications  ⚙️   │
├──────────────┬─────────────────────────────────────────────────────────────────────────┤
│ Top Navigation│  UNDERSTAND   BUILD   INVESTIGATE   ARCHITECTURE   ENGINEERING HEALTH   │
├──────────────┼─────────────────────────────────────────────────────────────────────────┤
│ Repositories │                                                                         │
│ 📁 OrderSvc  │                       MAIN WORKSPACE PANEL                              │
│ 📁 PaymentSvc│             (Universal System Explorer / Interactive Graph /             │
│              │              Monaco Editor / Architecture Matrix / Health Score)        │
│ Recent Tasks │                                                                         │
│ ⚡ Task #1042│                                                                         │
│ ⚡ Task #1043│                                                                         │
├──────────────┴─────────────────────────────────────────────────────────────────────────┤
│ 💻 Collapsible Bottom Panel: Agent Activity | Terminal | Evidence Trail | OpenTelemetry │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Flagship Universal System Explorer

The **System Explorer** provides a unified natural language interface for system understanding:

### User Query Example:
> *"How does payment processing work and what breaks if I change PaymentService?"*

### Auto-Synthesized Result:
1. **Interactive Path Flow**: `CheckoutController` → `PaymentService` → `StripeGateway` → `OrderDatabase`.
2. **Evidence Links**: Clickable source links (`PaymentService.cs:L84`, `StripeGateway.cs:L112`).
3. **Blast Radius Impact**: 14 affected files, 3 REST endpoints, 2 event queues (Risk: **HIGH**).
4. **Action Buttons**: `[Open Flow Graph]` `[Run Refactoring Agent]` `[Export Architecture Guard]`.

---

## 4. Monaco Editor & Contextual Evidence Inspector

- Full integration of Monaco Editor supporting syntax highlighting, inline diagnostics, minimap, Git blame gutters, and split-pane diff comparisons.
- Clicking any evidence item throughout CodeAtlas immediately navigates Monaco directly to the exact file and line range (`FilePath#L84-112`).

---

## 5. Command Palette (`⌘K`)

Global modal shortcut allowing instant search across:
- AST Symbols (`PaymentService`, `OrderCreatedEvent`)
- REST Routes (`POST /api/v1/orders`)
- Agent Commands (`Run Bug Fix Agent`, `Export CI Workflow`)
- Workspace Views (`Switch to System Explorer`, `Open Engineering Health`)
