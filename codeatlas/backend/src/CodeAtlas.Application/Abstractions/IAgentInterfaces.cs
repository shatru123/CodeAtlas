using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Abstractions;

public class ToolExecutionResult
{
    public bool Success { get; set; } = true;
    public string Output { get; set; } = string.Empty;
    public string Error { get; set; } = string.Empty;
    public List<Evidence> EvidenceItems { get; set; } = new();
    public Dictionary<string, object> Data { get; set; } = new();
}

public interface IAgentTool
{
    string Name { get; }
    string Description { get; }
    string Category { get; } // Search, AST, Git, Execution, Security, Refactor
    bool RequiresApproval { get; }
    Task<ToolExecutionResult> ExecuteAsync(string repoRootPath, Dictionary<string, object> parameters, CancellationToken cancellationToken = default);
}

public interface IAgentToolRegistry
{
    void RegisterTool(IAgentTool tool);
    IEnumerable<IAgentTool> GetAllTools();
    IAgentTool? GetTool(string name);
}

public interface IAgentExecutionStore
{
    Task SaveTaskAsync(AgentTask task);
    Task<AgentTask?> GetTaskAsync(Guid taskId);
    Task<IEnumerable<AgentTask>> ListTasksAsync(string? repositoryId = null);
    Task AddStepAsync(Guid taskId, AgentStep step);
}

public interface ISandboxManager
{
    Task<bool> IsDockerAvailableAsync();
    Task<ToolExecutionResult> RunInSandboxAsync(string repoPath, string command, int timeoutSeconds = 60, CancellationToken cancellationToken = default);
}

public interface ILLMProvider
{
    string ProviderName { get; }
    Task<string> GenerateResponseAsync(string prompt, string? systemInstruction = null, CancellationToken cancellationToken = default);
    Task<string> SelectToolAndArgsAsync(string goal, IEnumerable<IAgentTool> availableTools, string contextText, CancellationToken cancellationToken = default);
}

public interface IAgentOrchestrator
{
    Task<AgentTask> CreateAndStartTaskAsync(string repositoryId, string prompt, AgentTaskType type, CancellationToken cancellationToken = default);
    Task<AgentTask?> GetTaskStatusAsync(Guid taskId);
    Task<IEnumerable<AgentTask>> ListTasksAsync(string? repositoryId = null);
    Task<bool> ApproveTaskGateAsync(Guid taskId, bool approved, string userFeedback);
    Task<bool> CancelTaskAsync(Guid taskId);
}
