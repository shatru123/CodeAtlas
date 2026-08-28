using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CodeAtlas.Application.Services;

namespace CodeAtlas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly EngineeringHealthService _healthService;
    private readonly CrossRepoExplorerService _crossRepoService;

    public HealthController(EngineeringHealthService healthService, CrossRepoExplorerService crossRepoService)
    {
        _healthService = healthService;
        _crossRepoService = crossRepoService;
    }

    [HttpGet("radar/{repoId}")]
    public async Task<IActionResult> GetHealthRadar(string repoId)
    {
        var radar = await _healthService.CalculateHealthRadarAsync(repoId);
        return Ok(radar);
    }

    [HttpGet("cross-repo")]
    public async Task<IActionResult> GetCrossRepoTopology()
    {
        var topology = await _crossRepoService.BuildCrossRepoTopologyAsync();
        return Ok(topology);
    }
}
