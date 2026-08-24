using Microsoft.AspNetCore.Mvc;
using CodeAtlas.Server.Models;
using CodeAtlas.Server.Services;

namespace CodeAtlas.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgentTaskController : ControllerBase
{
    private readonly IAgentOrchestratorService _orchestratorService;
    private readonly IGitWorkspaceService _workspaceService;

    public AgentTaskController(IAgentOrchestratorService orchestratorService, IGitWorkspaceService workspaceService)
    {
        _orchestratorService = orchestratorService;
        _workspaceService = workspaceService;
    }

    [HttpPost("start")]
    public async Task<IActionResult> StartTask([FromBody] StartTaskRequest request)
    {
        var taskId = Guid.NewGuid().ToString("N")[..8];
        var initialStatus = await _orchestratorService.StartTaskAsync(taskId, request);
        return Ok(initialStatus);
    }

    [HttpGet("{taskId}")]
    public async Task<IActionResult> GetTaskStatus(string taskId)
    {
        var status = await _orchestratorService.GetTaskStatusAsync(taskId);
        if (status == null) return NotFound($"Task '{taskId}' not found.");
        return Ok(status);
    }

    [HttpGet("{taskId}/diffs")]
    public async Task<IActionResult> GetGitDiffs(string taskId)
    {
        var diffs = await _workspaceService.GetGitDiffsAsync(taskId);
        return Ok(diffs);
    }
}
