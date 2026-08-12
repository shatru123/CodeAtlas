using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CodeAtlas.Api.Dtos;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Application.Services;
using CodeAtlas.Domain.Models;
using CodeAtlas.Infrastructure.Detectors;

namespace CodeAtlas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RepositoriesController : ControllerBase
{
    private readonly IRepositoryScanner _scanner;
    private readonly IKnowledgeStore _knowledgeStore;

    public RepositoriesController(IRepositoryScanner scanner, IKnowledgeStore knowledgeStore)
    {
        _scanner = scanner;
        _knowledgeStore = knowledgeStore;
    }

    [HttpPost("local")]
    public async Task<IActionResult> ScanLocalRepository([FromBody] LocalScanRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Path))
        {
            return BadRequest(new { error = "Local repository path is required." });
        }

        try
        {
            var result = await _scanner.ScanLocalRepositoryAsync(request.Path);
            return Ok(result);
        }
        catch (DirectoryNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("github")]
    public async Task<IActionResult> ScanGitHubRepository([FromBody] GitHubScanRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Url))
        {
            return BadRequest(new { error = "GitHub repository URL is required." });
        }

        try
        {
            var result = await _scanner.ScanGitHubRepositoryAsync(request.Url, request.Branch, request.Commit, request.AccessToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("scan")]
    public async Task<IActionResult> ScanRepository([FromBody] ScanRequestDto request)
    {
        var pathOrUrl = !string.IsNullOrWhiteSpace(request.Url) ? request.Url : request.Path;
        if (string.IsNullOrWhiteSpace(pathOrUrl))
        {
            return BadRequest(new { error = "Repository path or Git URL is required." });
        }

        try
        {
            if (!string.IsNullOrWhiteSpace(request.Url) || pathOrUrl.StartsWith("http") || pathOrUrl.StartsWith("git@") || pathOrUrl.Contains("github.com"))
            {
                var result = await _scanner.ScanGitHubRepositoryAsync(pathOrUrl, request.Branch, request.Commit, request.AccessToken);
                return Ok(result);
            }
            else
            {
                var result = await _scanner.ScanLocalRepositoryAsync(pathOrUrl);
                return Ok(result);
            }
        }
        catch (DirectoryNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> ListRepositories()
    {
        var repos = await _knowledgeStore.ListRepositoriesAsync();
        return Ok(repos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRepository(string id)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });
        return Ok(analysis);
    }

    [HttpGet("{id}/entities")]
    public async Task<IActionResult> GetEntities(string id, [FromQuery] string? type)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });

        var entities = analysis.Entities.AsQueryable();
        if (!string.IsNullOrEmpty(type) && Enum.TryParse<EntityType>(type, true, out var entityType))
        {
            entities = entities.Where(e => e.Type == entityType);
        }

        return Ok(entities.ToList());
    }

    [HttpGet("{id}/relationships")]
    public async Task<IActionResult> GetRelationships(string id, [FromQuery] string? type)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });

        var rels = analysis.Relationships.AsQueryable();
        if (!string.IsNullOrEmpty(type) && Enum.TryParse<RelationshipType>(type, true, out var relType))
        {
            rels = rels.Where(r => r.Type == relType);
        }

        return Ok(rels.ToList());
    }

    [HttpGet("{id}/apis")]
    public async Task<IActionResult> GetApis(string id)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });
        return Ok(analysis.Apis);
    }

    [HttpGet("{id}/databases")]
    public async Task<IActionResult> GetDatabases(string id)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });
        return Ok(analysis.Databases);
    }

    [HttpGet("{id}/events")]
    public async Task<IActionResult> GetEvents(string id)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });
        return Ok(analysis.Events);
    }

    [HttpGet("{id}/packages")]
    public async Task<IActionResult> GetPackages(string id)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });
        return Ok(analysis.Packages);
    }

    [HttpGet("{id}/flows")]
    public async Task<IActionResult> GetFlows(string id)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });
        return Ok(analysis.Flows);
    }

    [HttpGet("{id}/security")]
    public async Task<IActionResult> GetSecurity(string id)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });
        return Ok(analysis.SecurityAudit);
    }

    [HttpGet("/api/workspace/mesh")]
    public async Task<IActionResult> GetWorkspaceMesh()
    {
        var repos = await _knowledgeStore.ListRepositoriesAsync();
        var analyses = new List<AnalysisResult>();
        foreach (var repo in repos)
        {
            var analysis = await _knowledgeStore.GetAnalysisAsync(repo.Id);
            if (analysis != null) analyses.Add(analysis);
        }
        var mesh = MeshEngine.BuildWorkspaceMesh(analyses);
        return Ok(mesh);
    }

    [HttpGet("{id}/impact")]
    public async Task<IActionResult> GetBlastRadius(string id, [FromQuery] string? entityName)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });

        var repos = await _knowledgeStore.ListRepositoriesAsync();
        var analyses = new List<AnalysisResult>();
        foreach (var repo in repos)
        {
            var a = await _knowledgeStore.GetAnalysisAsync(repo.Id);
            if (a != null) analyses.Add(a);
        }
        var mesh = MeshEngine.BuildWorkspaceMesh(analyses);
        var blast = ImpactEngine.CalculateBlastRadius(entityName ?? "", analysis, mesh);
        return Ok(blast);
    }

    [HttpGet("{id}/diff")]
    public async Task<IActionResult> GetBranchDiff(string id, [FromQuery] string? targetBranch)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });
        var diff = BranchDiffEngine.CompareBranches(analysis, targetBranch ?? "main");
        return Ok(diff);
    }

    [HttpGet("{id}/erd")]
    public async Task<IActionResult> GetDatabaseErd(string id)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });
        var erd = ErdEngine.SynthesizeErd(analysis);
        return Ok(erd);
    }

    [HttpGet("{id}/infrastructure")]
    public async Task<IActionResult> GetInfrastructure(string id)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });
        var infra = InfrastructureDetector.ExtractInfrastructure(analysis.Repository.RootPath);
        return Ok(infra);
    }

    [HttpGet("{id}/handbook")]
    public async Task<IActionResult> GetHandbook(string id)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });
        var handbook = HandbookExporter.GenerateHandbook(analysis);
        return Ok(handbook);
    }

    [HttpGet("{id}/architecture")]
    public async Task<IActionResult> GetArchitecture(string id)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });

        var violations = analysis.Relationships.Where(r => r.Context?.Contains("VIOLATION") == true).ToList();
        var controllers = analysis.Entities.Count(e => e.Type == EntityType.Controller);
        var services = analysis.Entities.Count(e => e.Type == EntityType.Service);
        var repos = analysis.Entities.Count(e => e.Type == EntityType.Repository);

        return Ok(new
        {
            Repository = analysis.Repository.Name,
            Controllers = controllers,
            Services = services,
            Repositories = repos,
            Violations = violations,
            ArchitecturePattern = (controllers > 0 && services > 0 && repos > 0) ? "Clean / Layered Architecture" : "Standard Monolith / Service Pattern"
        });
    }

    [HttpGet("{id}/technologies")]
    public async Task<IActionResult> GetTechnologies(string id)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });

        return Ok(new
        {
            Languages = analysis.Repository.Languages,
            TechStack = analysis.Repository.TechStack
        });
    }

    [HttpGet("{id}/runner/detect")]
    public async Task<IActionResult> DetectRunner(string id)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });
        var detection = RepoRunnerService.DetectRuntime(analysis.Repository.RootPath);
        return Ok(detection);
    }

    [HttpPost("{id}/runner/execute")]
    public async Task<IActionResult> ExecuteCode(string id, [FromBody] ExecuteCodeRequest req)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(id);
        if (analysis == null) return NotFound(new { error = "Repository not found." });
        var detection = RepoRunnerService.DetectRuntime(analysis.Repository.RootPath);
        var cmd = !string.IsNullOrWhiteSpace(req.CustomCommand) ? req.CustomCommand : detection.RecommendedCommand;
        var result = await RepoRunnerService.ExecuteCommandAsync(id, analysis.Repository.RootPath, cmd, req.TimeoutSeconds > 0 ? req.TimeoutSeconds : 60);
        return Ok(result);
    }

    [HttpPost("{id}/runner/stop")]
    public IActionResult StopCode(string id)
    {
        var stopped = RepoRunnerService.StopProcess(id);
        return Ok(new { stopped });
    }
}
