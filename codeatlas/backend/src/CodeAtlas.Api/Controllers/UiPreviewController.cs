using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CodeAtlas.Application.Services;

namespace CodeAtlas.Api.Controllers;

public class GenerateMockDataDto
{
    public string ComponentName { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class UiPreviewController : ControllerBase
{
    private readonly UiPreviewGeneratorService _previewService;

    public UiPreviewController(UiPreviewGeneratorService previewService)
    {
        _previewService = previewService;
    }

    [HttpGet("{repoId}/components")]
    public async Task<IActionResult> GetComponents(string repoId)
    {
        var result = await _previewService.GetPreviewComponentsAsync(repoId);
        return Ok(result);
    }

    [HttpPost("{repoId}/generate-mock-data")]
    public async Task<IActionResult> GenerateMockData(string repoId, [FromBody] GenerateMockDataDto dto)
    {
        var json = await _previewService.GenerateSyntheticMockDataOnTheFlyAsync(dto.ComponentName, repoId);
        return Ok(new { componentName = dto.ComponentName, mockDataJson = json });
    }
}
