using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CodeAtlas.Application.Services;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Api.Controllers;

public class RcaRequestDto
{
    public string RepositoryId { get; set; } = string.Empty;
    public string StackTrace { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class InvestigateController : ControllerBase
{
    private readonly RcaEngineService _rcaService;

    public InvestigateController(RcaEngineService rcaService)
    {
        _rcaService = rcaService;
    }

    [HttpPost("rca")]
    public async Task<IActionResult> AnalyzeRca([FromBody] RcaRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.StackTrace))
        {
            return BadRequest(new { error = "Production stack trace log is required." });
        }

        var result = await _rcaService.AnalyzeStackTraceAsync(dto.RepositoryId, dto.StackTrace);
        return Ok(result);
    }
}
