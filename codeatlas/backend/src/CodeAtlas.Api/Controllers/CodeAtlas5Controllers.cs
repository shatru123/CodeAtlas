using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CodeAtlas.Application.Services;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Api.Controllers;

[ApiController]
[Route("api/codereview")]
public class AiCodeReviewerController : ControllerBase
{
    private readonly AiCodeReviewerService _reviewerService;

    public AiCodeReviewerController(AiCodeReviewerService reviewerService)
    {
        _reviewerService = reviewerService;
    }

    [HttpGet("{repoId}")]
    public async Task<IActionResult> ReviewCodebase(string repoId)
    {
        var report = await _reviewerService.ReviewCodebaseAsync(repoId);
        return Ok(report);
    }
}

[ApiController]
[Route("api/apiguard")]
public class ApiGuardController : ControllerBase
{
    private readonly ApiBreakingChangeDetectorService _apiGuardService;

    public ApiGuardController(ApiBreakingChangeDetectorService apiGuardService)
    {
        _apiGuardService = apiGuardService;
    }

    [HttpGet("{repoId}")]
    public async Task<IActionResult> DetectBreakingChanges(string repoId)
    {
        var report = await _apiGuardService.DetectBreakingChangesAsync(repoId);
        return Ok(report);
    }
}

[ApiController]
[Route("api/finops")]
public class CloudFinOpsController : ControllerBase
{
    private readonly CloudFinOpsEstimatorService _finOpsService;

    public CloudFinOpsController(CloudFinOpsEstimatorService finOpsService)
    {
        _finOpsService = finOpsService;
    }

    [HttpGet("{repoId}")]
    public async Task<IActionResult> EstimateCloudCosts(string repoId)
    {
        var report = await _finOpsService.EstimateCloudCostsAsync(repoId);
        return Ok(report);
    }
}

[ApiController]
[Route("api/playground")]
public class ApiPlaygroundController : ControllerBase
{
    private readonly ApiPlaygroundService _playgroundService;

    public ApiPlaygroundController(ApiPlaygroundService playgroundService)
    {
        _playgroundService = playgroundService;
    }

    [HttpPost("execute")]
    public async Task<IActionResult> ExecuteRequest([FromBody] ApiPlaygroundRequest request)
    {
        var result = await _playgroundService.ExecuteApiRequestAsync(request);
        return Ok(result);
    }
}

[ApiController]
[Route("api/visualarch")]
public class VisualArchController : ControllerBase
{
    private readonly VisualArchBuilderService _visualArchService;

    public VisualArchController(VisualArchBuilderService visualArchService)
    {
        _visualArchService = visualArchService;
    }

    [HttpGet("{repoId}")]
    public async Task<IActionResult> GetVisualCanvasNodes(string repoId)
    {
        var canvas = await _visualArchService.GetVisualCanvasNodesAsync(repoId);
        return Ok(canvas);
    }
}
