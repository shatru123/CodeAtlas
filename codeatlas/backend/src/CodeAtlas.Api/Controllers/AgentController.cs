using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Api.Controllers;

public class CreateAgentTaskDto
{
    public string RepositoryId { get; set; } = string.Empty;
    public string Prompt { get; set; } = string.Empty;
    public AgentTaskType Type { get; set; } = AgentTaskType.GeneralQuery;
}

public class ApproveTaskDto
{
    public bool Approved { get; set; } = true;
    public string UserFeedback { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class AgentController : ControllerBase
{
    private readonly IAgentOrchestrator _orchestrator;

    public AgentController(IAgentOrchestrator orchestrator)
    {
        _orchestrator = orchestrator;
    }

    [HttpPost("tasks")]
    public async Task<IActionResult> CreateTask([FromBody] CreateAgentTaskDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Prompt))
        {
            return BadRequest(new { error = "Task prompt is required." });
        }

        var task = await _orchestrator.CreateAndStartTaskAsync(dto.RepositoryId, dto.Prompt, dto.Type);
        return Ok(task);
    }

    [HttpGet("tasks")]
    public async Task<IActionResult> ListTasks([FromQuery] string? repositoryId)
    {
        var tasks = await _orchestrator.ListTasksAsync(repositoryId);
        return Ok(tasks);
    }

    [HttpGet("tasks/{id}")]
    public async Task<IActionResult> GetTask(Guid id)
    {
        var task = await _orchestrator.GetTaskStatusAsync(id);
        if (task == null) return NotFound(new { error = "Agent task not found." });
        return Ok(task);
    }

    [HttpPost("tasks/{id}/approve")]
    public async Task<IActionResult> ApproveTask(Guid id, [FromBody] ApproveTaskDto dto)
    {
        var result = await _orchestrator.ApproveTaskGateAsync(id, dto.Approved, dto.UserFeedback);
        if (!result) return NotFound(new { error = "Agent task not found." });
        return Ok(new { success = true, status = dto.Approved ? "Approved" : "Cancelled" });
    }

    [HttpPost("tasks/{id}/cancel")]
    public async Task<IActionResult> CancelTask(Guid id)
    {
        var result = await _orchestrator.CancelTaskAsync(id);
        if (!result) return NotFound(new { error = "Agent task not found." });
        return Ok(new { success = true, status = "Cancelled" });
    }
}
