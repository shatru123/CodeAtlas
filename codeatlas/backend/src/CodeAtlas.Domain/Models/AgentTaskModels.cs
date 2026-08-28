using System;
using System.Collections.Generic;

namespace CodeAtlas.Domain.Models;

public enum AgentTaskStatus
{
    Queued,
    Running,
    WaitingForApproval,
    Completed,
    Failed,
    Cancelled
}

public enum AgentTaskType
{
    GeneralQuery,
    BugFix,
    Refactoring,
    Migration,
    DependencyUpgrade,
    TestGeneration,
    RootCauseAnalysis
}

public enum EvidenceType
{
    AST,
    GitBlame,
    RuntimeTrace,
    LogEntry,
    MetricSpike,
    ArchitectureRule
}

public class Evidence
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FilePath { get; set; } = string.Empty;
    public int StartLine { get; set; }
    public int EndLine { get; set; }
    public string SymbolName { get; set; } = string.Empty;
    public string Snippet { get; set; } = string.Empty;
    public double ConfidenceScore { get; set; } = 1.0;
    public EvidenceType Type { get; set; } = EvidenceType.AST;
    public string Rationale { get; set; } = string.Empty;
}

public class AgentToolCall
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ToolName { get; set; } = string.Empty;
    public string ArgumentsJson { get; set; } = "{}";
    public string ResultJson { get; set; } = "{}";
    public bool IsSuccess { get; set; } = true;
    public string ErrorMessage { get; set; } = string.Empty;
    public long DurationMs { get; set; }
    public DateTimeOffset ExecutedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class AgentStep
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TaskId { get; set; }
    public int StepIndex { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Phase { get; set; } = "Research"; // Research, Impact, Plan, Execute, Validate, Deliver
    public AgentToolCall? ToolCall { get; set; }
    public List<Evidence> EvidenceList { get; set; } = new();
    public DateTimeOffset Timestamp { get; set; } = DateTimeOffset.UtcNow;
}

public class AgentTask
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string RepositoryId { get; set; } = string.Empty;
    public string Prompt { get; set; } = string.Empty;
    public AgentTaskType Type { get; set; } = AgentTaskType.GeneralQuery;
    public AgentTaskStatus Status { get; set; } = AgentTaskStatus.Queued;
    public int ProgressPercentage { get; set; } = 0;
    public string CurrentPhase { get; set; } = "Initializing";
    public string BranchName { get; set; } = string.Empty;
    public string PullRequestUrl { get; set; } = string.Empty;
    public string ExecutionSummary { get; set; } = string.Empty;
    public List<AgentStep> Timeline { get; set; } = new();
    public List<Evidence> AllEvidence { get; set; } = new();
    public List<string> TouchedFiles { get; set; } = new();
    public string DiffPatch { get; set; } = string.Empty;
    public string FailureReason { get; set; } = string.Empty;
    public bool RequiresHumanApproval { get; set; } = false;
    public string ApprovalReason { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? CompletedAt { get; set; }
}
