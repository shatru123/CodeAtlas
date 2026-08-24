namespace CodeAtlas.Server.Models;

public record CloneWorkspaceRequest(
    string RepoUrl,
    string? Branch = "main",
    string? AccessToken = null
);

public record WorkspaceStatusResponse(
    string TaskId,
    string RepoUrl,
    string LocalPath,
    bool IsCloned,
    int TotalFiles,
    DateTime CreatedAt
);

public record FileTreeNode(
    string Name,
    string Path,
    bool IsDirectory,
    List<FileTreeNode>? Children = null,
    long? SizeInBytes = null
);

public record StartTaskRequest(
    string RepoUrl,
    string TaskDescription,
    string? TargetBranch = "feature/ai-agent-update",
    string? Model = "claude-3-5-sonnet-20241022"
);

public record TaskStatusResponse(
    string TaskId,
    string Status, // Created, Planning, Researching, Coding, Validating, Completed, Failed
    string CurrentAgent,
    int CurrentStep,
    List<AgentStepEvent> Steps,
    List<CodeDiffModel> Diffs,
    DateTime StartedAt,
    DateTime? CompletedAt
);

public record AgentStepEvent(
    string StepId,
    string AgentName, // Planner, Researcher, Coder, Validator
    string Thought,
    string? ActionName,
    string? ActionInput,
    string? ActionOutput,
    DateTime Timestamp
);

public record CodeDiffModel(
    string FilePath,
    string OriginalContent,
    string ModifiedContent,
    string Patch
);

public record ToolCallModel(
    string ToolName,
    Dictionary<string, object> Parameters
);
