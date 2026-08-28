# CODEATLAS 3.0 DATA MODEL & PERSISTENCE SPECIFICATION

---

## 1. Relational Entity Schema (PostgreSQL + EF Core)

CodeAtlas 3.0 uses Entity Framework Core to map domain models to PostgreSQL tables:

```
┌─────────────────┐       ┌─────────────────┐       ┌──────────────────┐
│  Organization   │1     *│   Repository    │1     *│    GraphNode     │
│  - Id           ├───────┤   - Id          ├───────┤    - Id          │
│  - Name         │       │   - Name        │       │    - EntityType  │
└─────────────────┘       │   - RootPath    │       │    - Name        │
                          └────────┬────────┘       │    - FilePath    │
                                   │                └────────┬─────────┘
                                   │1                        │1
                                   │                         │
                                   │*                        │*
                          ┌────────┴────────┐       ┌────────┴─────────┐
                          │    AgentTask    │       │ GraphRelationship│
                          │   - Id          │       │  - Id            │
                          │   - Status      │       │  - RelType       │
                          │   - Progress    │       │  - SourceNodeId  │
                          └────────┬────────┘       │  - TargetNodeId  │
                                   │                └──────────────────┘
                                   │1
                                   │*
                          ┌────────┴────────┐
                          │    AgentStep    │
                          │   - Id          │
                          │   - ToolName    │
                          │   - Output      │
                          └─────────────────┘
```

---

## 2. Core Entity Definitions

### `AgentTask`
Represents an asynchronous autonomous agent task:
- `Id` (Guid, PK)
- `RepositoryId` (string, FK)
- `Title` (string)
- `Status` (Enum: `Queued`, `Running`, `WaitingForApproval`, `Completed`, `Failed`, `Cancelled`)
- `ProgressPercentage` (int)
- `BranchName` (string)
- `PullRequestUrl` (string)
- `CreatedAt`, `CompletedAt` (DateTimeOffset)

### `AgentStep`
Represents individual tool calls and reasoning events:
- `Id` (Guid, PK)
- `TaskId` (Guid, FK)
- `StepNumber` (int)
- `ToolName` (string)
- `ArgumentsJson` (string)
- `OutputJson` (string)
- `Status` (string)
- `DurationMs` (long)

### `Evidence`
Connects graph nodes, relationships, and agent conclusions to physical code:
- `Id` (Guid, PK)
- `RelationshipId` (Guid, FK, Nullable)
- `FilePath` (string)
- `StartLine` (int)
- `EndLine` (int)
- `SymbolName` (string)
- `ConfidenceScore` (double)
- `EvidenceType` (Enum: `AST`, `GitBlame`, `RuntimeTrace`, `LogEntry`, `MetricSpike`)

---

## 3. Knowledge Graph Entity Structure

### `GraphNode`
- `NodeType`: `Repository`, `Service`, `Class`, `Interface`, `Method`, `Controller`, `API`, `Database`, `Table`, `Event`, `Package`, `Infrastructure`, `Commit`, `PullRequest`, `Trace`.

### `GraphRelationship`
- `RelationType`: `Calls`, `Implements`, `Inherits`, `DependsOn`, `ReadsFrom`, `WritesTo`, `Publishes`, `Consumes`, `Exposes`, `Invokes`, `Uses`, `Deploys`, `ModifiedBy`, `CausedBy`.
