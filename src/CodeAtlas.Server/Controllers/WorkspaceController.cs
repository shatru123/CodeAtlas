using Microsoft.AspNetCore.Mvc;
using CodeAtlas.Server.Models;
using CodeAtlas.Server.Services;

namespace CodeAtlas.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkspaceController : ControllerBase
{
    private readonly IGitWorkspaceService _workspaceService;
    private readonly ICodeIndexerService _indexerService;

    public WorkspaceController(IGitWorkspaceService workspaceService, ICodeIndexerService indexerService)
    {
        _workspaceService = workspaceService;
        _indexerService = indexerService;
    }

    [HttpPost("clone")]
    public async Task<IActionResult> CloneRepository([FromBody] CloneWorkspaceRequest request)
    {
        var taskId = Guid.NewGuid().ToString("N")[..8];
        var localPath = await _workspaceService.CloneRepositoryAsync(request.RepoUrl, taskId, request.Branch);
        return Ok(new WorkspaceStatusResponse(taskId, request.RepoUrl, localPath, true, 0, DateTime.UtcNow));
    }

    [HttpGet("{taskId}/tree")]
    public async Task<IActionResult> GetFileTree(string taskId)
    {
        try
        {
            var tree = await _workspaceService.GetFileTreeAsync(taskId);
            return Ok(tree);
        }
        catch (DirectoryNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("{taskId}/file")]
    public async Task<IActionResult> ReadFile(string taskId, [FromQuery] string path, [FromQuery] int? startLine, [FromQuery] int? endLine)
    {
        try
        {
            var content = await _workspaceService.ReadFileAsync(taskId, path, startLine, endLine);
            return Ok(new { FilePath = path, Content = content });
        }
        catch (FileNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
    }

    [HttpGet("{taskId}/symbols")]
    public async Task<IActionResult> SearchSymbols(string taskId, [FromQuery] string query = "")
    {
        var workspacePath = _workspaceService.GetWorkspacePath(taskId);
        var symbols = await _indexerService.SearchSymbolsAsync(workspacePath, query);
        return Ok(symbols);
    }
}
