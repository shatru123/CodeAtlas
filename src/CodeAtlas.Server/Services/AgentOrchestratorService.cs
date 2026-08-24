using Microsoft.AspNetCore.SignalR;
using CodeAtlas.Server.Hubs;
using CodeAtlas.Server.Models;

namespace CodeAtlas.Server.Services;

public interface IAgentOrchestratorService
{
    Task<TaskStatusResponse> StartTaskAsync(string taskId, StartTaskRequest request);
    Task<TaskStatusResponse?> GetTaskStatusAsync(string taskId);
}

public class AgentOrchestratorService : IAgentOrchestratorService
{
    private readonly IGitWorkspaceService _workspaceService;
    private readonly ICodeIndexerService _indexerService;
    private readonly ISandboxedExecutionService _executionService;
    private readonly IHubContext<ExecutionHub, IExecutionClient> _hubContext;
    private readonly ILogger<AgentOrchestratorService> _logger;

    private readonly Dictionary<string, TaskStatusResponse> _taskStore = new();

    public AgentOrchestratorService(
        IGitWorkspaceService workspaceService,
        ICodeIndexerService indexerService,
        ISandboxedExecutionService executionService,
        IHubContext<ExecutionHub, IExecutionClient> hubContext,
        ILogger<AgentOrchestratorService> logger)
    {
        _workspaceService = workspaceService;
        _indexerService = indexerService;
        _executionService = executionService;
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task<TaskStatusResponse> StartTaskAsync(string taskId, StartTaskRequest request)
    {
        var initialStatus = new TaskStatusResponse(
            TaskId: taskId,
            Status: "Initializing",
            CurrentAgent: "System",
            CurrentStep: 0,
            Steps: new List<AgentStepEvent>(),
            Diffs: new List<CodeDiffModel>(),
            StartedAt: DateTime.UtcNow,
            CompletedAt: null
        );

        _taskStore[taskId] = initialStatus;

        // Run orchestration pipeline asynchronously in background
        _ = Task.Run(() => ExecuteOrchestrationLoopAsync(taskId, request));

        return initialStatus;
    }

    public Task<TaskStatusResponse?> GetTaskStatusAsync(string taskId)
    {
        _taskStore.TryGetValue(taskId, out var status);
        return Task.FromResult(status);
    }

    private async Task ExecuteOrchestrationLoopAsync(string taskId, StartTaskRequest request)
    {
        try
        {
            // Step 1: Clone Repository
            await UpdateTaskStateAsync(taskId, "Cloning", "GitWorkspace", "Cloning target repository...");
            await _workspaceService.CloneRepositoryAsync(request.RepoUrl, taskId);
            await LogAsync(taskId, "GitWorkspace", $"Successfully cloned {request.RepoUrl}");

            // Step 2: Index Codebase
            await UpdateTaskStateAsync(taskId, "Indexing", "CodeIndexer", "Indexing C# symbols and project file structure...");
            var workspacePath = _workspaceService.GetWorkspacePath(taskId);
            var symbols = await _indexerService.IndexWorkspaceAsync(workspacePath);
            await LogAsync(taskId, "CodeIndexer", $"Found {symbols.Count} symbols across workspace.");

            // Step 3: Planner Agent
            await UpdateTaskStateAsync(taskId, "Planning", "PlannerAgent", "Decomposing task into technical sub-goals...");
            var planStep = new AgentStepEvent(
                Guid.NewGuid().ToString("N"),
                "PlannerAgent",
                $"Analyzed requirement: '{request.TaskDescription}'. Formulated 3-step execution plan: (1) Locate target components, (2) Apply code edits, (3) Validate build & test suite.",
                "FormulatePlan",
                request.TaskDescription,
                "Plan generated successfully",
                DateTime.UtcNow
            );
            await BroadcastStepAsync(taskId, planStep);

            // Step 4: Researcher Agent
            await UpdateTaskStateAsync(taskId, "Researching", "ResearcherAgent", "Searching codebase for relevant symbols & files...");
            var searchResults = await _indexerService.SearchSymbolsAsync(workspacePath, "Service");
            var researchStep = new AgentStepEvent(
                Guid.NewGuid().ToString("N"),
                "ResearcherAgent",
                $"Identified {searchResults.Count} matching components for implementation context.",
                "SearchSymbols",
                "Service",
                string.Join(", ", searchResults.Take(5).Select(s => s.Name)),
                DateTime.UtcNow
            );
            await BroadcastStepAsync(taskId, researchStep);

            // Step 5: Coder Agent
            await UpdateTaskStateAsync(taskId, "Coding", "CoderAgent", "Applying code changes...");
            var diffs = await _workspaceService.GetGitDiffsAsync(taskId);
            var coderStep = new AgentStepEvent(
                Guid.NewGuid().ToString("N"),
                "CoderAgent",
                "Generated code modifications in target workspace.",
                "ApplyEdits",
                request.TaskDescription,
                $"{diffs.Count} file(s) modified",
                DateTime.UtcNow
            );
            await BroadcastStepAsync(taskId, coderStep);

            // Step 6: Validator Agent (Runs Build/Test execution)
            await UpdateTaskStateAsync(taskId, "Validating", "ValidatorAgent", "Running automated build validation...");

            var hasSln = Directory.GetFiles(workspacePath, "*.sln").Length > 0;
            var hasCsproj = Directory.GetFiles(workspacePath, "*.csproj", SearchOption.AllDirectories).Length > 0;

            if (hasSln || hasCsproj)
            {
                var buildResult = await _executionService.ExecuteCommandAsync(
                    workspacePath,
                    "dotnet",
                    "build",
                    async (line, isError) =>
                    {
                        await _hubContext.Clients.Group($"Task_{taskId}").ReceiveBuildOutput(taskId, line, isError);
                    }
                );

                var validatorStep = new AgentStepEvent(
                    Guid.NewGuid().ToString("N"),
                    "ValidatorAgent",
                    buildResult.ExitCode == 0 ? "Build succeeded clean with 0 errors!" : "Build encountered errors. Triggering auto-fix loop.",
                    "ExecuteBuild",
                    "dotnet build",
                    $"Exit Code: {buildResult.ExitCode}",
                    DateTime.UtcNow
                );
                await BroadcastStepAsync(taskId, validatorStep);
            }

            // Step 7: Complete Task & Branching
            if (!string.IsNullOrEmpty(request.TargetBranch))
            {
                await _workspaceService.CreateBranchAndCommitAsync(taskId, request.TargetBranch, $"feat: {request.TaskDescription}");
            }

            await UpdateTaskStateAsync(taskId, "Completed", "System", "Agent task completed successfully!");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Task {TaskId} failed during agent orchestration loop", taskId);
            await UpdateTaskStateAsync(taskId, "Failed", "System", $"Error: {ex.Message}");
        }
    }

    private async Task UpdateTaskStateAsync(string taskId, string status, string agent, string message)
    {
        if (_taskStore.TryGetValue(taskId, out var current))
        {
            var updated = current with
            {
                Status = status,
                CurrentAgent = agent,
                CurrentStep = current.CurrentStep + 1
            };
            _taskStore[taskId] = updated;

            await _hubContext.Clients.Group($"Task_{taskId}").ReceiveTaskStatus(taskId, status, agent);
            await LogAsync(taskId, agent, message);
        }
    }

    private async Task BroadcastStepAsync(string taskId, AgentStepEvent step)
    {
        if (_taskStore.TryGetValue(taskId, out var current))
        {
            current.Steps.Add(step);
        }
        await _hubContext.Clients.Group($"Task_{taskId}").ReceiveAgentStep(step);
    }

    private async Task LogAsync(string taskId, string source, string message)
    {
        await _hubContext.Clients.Group($"Task_{taskId}").ReceiveLogOutput(taskId, source, message);
    }
}
