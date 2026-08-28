# CODEATLAS 3.0 AGENT ARCHITECTURE SPECIFICATION

---

## 1. Dynamic Tool-Driven Agent Loop

CodeAtlas 3.0 replaces rigid, hard-coded agent pipelines with a dynamic, LLM tool-driven loop. The agent evaluates goals, selects tools, inspects evidence, constructs plans, modifies code inside Docker sandboxes, validates builds/tests, and handles errors autonomously.

```
                  ┌────────────────────────┐
                  │   User Task Request    │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │  Context Gathering     │
                  │  (AST, Graph, Git)     │
                  └───────────┬────────────┘
                              │
                              ▼
                  ┌────────────────────────┐◄────────────────┐
                  │  LLM Tool Choice Loop  │                 │
                  └───────────┬────────────┘                 │
                              │                              │
         ┌────────────────────┼────────────────────┐         │
         ▼                    ▼                    ▼         │ Tool Result &
    [Read Tool]          [Search Tool]        [Execute Tool] │ Evidence Loop
         │                    │                    │         │
         └────────────────────┼────────────────────┘         │
                              ▼                              │
                  ┌────────────────────────┐                 │
                  │ Sandbox Code Change    ├─────────────────┘
                  │ Build & Test Validation│
                  └───────────┬────────────┘
                              │ All Checks Pass
                              ▼
                  ┌────────────────────────┐
                  │ Create Git PR & Done   │
                  └────────────────────────┘
```

---

## 2. Core Abstractions & Interfaces

```csharp
namespace CodeAtlas.Agent.Abstractions;

public interface IAgentOrchestrator
{
    Task<AgentTask> StartTaskAsync(string repoId, string prompt, AgentTaskType type, CancellationToken cancellationToken);
    Task PauseTaskForApprovalAsync(string taskId, string stepId, string reason);
    Task ResumeTaskAsync(string taskId, bool approved, string userFeedback);
    Task CancelTaskAsync(string taskId);
}

public interface IAgentTool
{
    string Name { get; }
    string Description { get; }
    object ParameterSchema { get; }
    bool RequiresApproval { get; }
    Task<ToolExecutionResult> ExecuteAsync(IAgentWorkspace workspace, Dictionary<string, object> args, CancellationToken cancellationToken);
}

public interface IAgentToolRegistry
{
    void RegisterTool(IAgentTool tool);
    IEnumerable<IAgentTool> GetTools();
    IAgentTool? GetTool(string name);
}

public interface ILLMProvider
{
    string ProviderName { get; }
    Task<LLMResponse> CompleteAsync(LLMRequest request, CancellationToken cancellationToken);
}
```

---

## 3. Comprehensive Tool Definitions (30+ Tools)

| Category | Tool Name | Description |
| :--- | :--- | :--- |
| **Search** | `search_code` | Grep text/regex across solution files |
| **Search** | `search_symbol` | Find symbol definition by name in Roslyn AST |
| **Code Reading**| `read_file` | Read full content of source file |
| **Code Reading**| `read_file_range` | Read specific lines from file |
| **AST Inspection**| `find_references` | Find all incoming/outgoing references to symbol |
| **AST Inspection**| `find_callers` | List all callers of method |
| **AST Inspection**| `find_callees` | List all methods invoked by target function |
| **Solution** | `inspect_project` | Analyze project dependencies & framework target |
| **Impact** | `calculate_impact` | Compute Blast Radius risk prior to edits |
| **Git** | `git_blame` | Retrieve author & commit context per line |
| **Git** | `search_commits` | Search commit messages & historical diffs |
| **Build & Test**| `run_build` | Execute `dotnet build` inside sandbox |
| **Build & Test**| `run_tests` | Run xUnit / NUnit test suites inside sandbox |
| **Code Mutation**| `write_file` | Overwrite file with new content |
| **Code Mutation**| `apply_patch` | Apply unified diff patch to source code |
| **Git Action** | `create_branch` | Create new Git branch (`codeatlas/agent/...`) |
| **Git Action** | `commit_changes` | Stage and commit validated workspace edits |
| **Git Action** | `create_pull_request`| Open PR on GitHub / GitLab / Bitbucket |

---

## 4. Human Approval Gate Policies

The agent loop pauses and awaits user confirmation before executing high-risk operations:

```json
{
  "approvalPolicies": {
    "delete_file": "Always",
    "modify_database_schema": "Always",
    "push_to_remote": "Always",
    "create_pull_request": "Prompt",
    "run_unit_tests": "AutoApprove"
  }
}
```

When an approval gate triggers, SignalR emits `TaskWaitingForApproval` event to the React UI Task Center.

---

## 5. Timeline & Evidence Trail

Every step executed by the agent emits structured timeline entries:

```json
{
  "timestamp": "19:32:15Z",
  "step": 4,
  "toolName": "calculate_impact",
  "status": "Success",
  "evidence": [
    { "file": "PaymentService.cs", "line": 84, "symbol": "ProcessPayment" }
  ],
  "durationMs": 420
}
```
