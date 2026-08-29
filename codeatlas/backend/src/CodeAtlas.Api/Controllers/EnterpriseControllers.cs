using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CodeAtlas.Application.Services;

namespace CodeAtlas.Api.Controllers;

public class GenerateTestRequestDto
{
    public string ClassName { get; set; } = string.Empty;
}

public class ParseLogRequestDto
{
    public string RawLog { get; set; } = string.Empty;
}

[ApiController]
[Route("api/testlab")]
public class TestLabController : ControllerBase
{
    private readonly TestGeneratorService _testService;

    public TestLabController(TestGeneratorService testService)
    {
        _testService = testService;
    }

    [HttpGet("{repoId}")]
    public async Task<IActionResult> GetSuites(string repoId)
    {
        var suites = await _testService.GetTestLabSuitesAsync(repoId);
        return Ok(suites);
    }

    [HttpPost("{repoId}/generate")]
    public async Task<IActionResult> GenerateSuite(string repoId, [FromBody] GenerateTestRequestDto dto)
    {
        var suite = await _testService.GenerateTestSuiteForClassAsync(repoId, dto.ClassName);
        return Ok(suite);
    }
}

[ApiController]
[Route("api/architecturerules")]
public class ArchitectureRulesController : ControllerBase
{
    private readonly ArchitectureRuleEngineService _ruleEngine;

    public ArchitectureRulesController(ArchitectureRuleEngineService ruleEngine)
    {
        _ruleEngine = ruleEngine;
    }

    [HttpGet("{repoId}")]
    public async Task<IActionResult> GetComplianceReport(string repoId)
    {
        var report = await _ruleEngine.EvaluateArchitectureRulesAsync(repoId);
        return Ok(report);
    }
}

[ApiController]
[Route("api/supplychain")]
public class SupplyChainSecurityController : ControllerBase
{
    private readonly SupplyChainSecurityService _securityService;

    public SupplyChainSecurityController(SupplyChainSecurityService securityService)
    {
        _securityService = securityService;
    }

    [HttpGet("{repoId}")]
    public async Task<IActionResult> AuditDependencies(string repoId)
    {
        var vulnerabilities = await _securityService.AuditDependenciesAsync(repoId);
        return Ok(vulnerabilities);
    }
}

[ApiController]
[Route("api/telemetry")]
public class TelemetryIncidentController : ControllerBase
{
    private readonly TelemetryLogParserService _logParser;

    public TelemetryIncidentController(TelemetryLogParserService logParser)
    {
        _logParser = logParser;
    }

    [HttpPost("{repoId}/parse-log")]
    public async Task<IActionResult> ParseLog(string repoId, [FromBody] ParseLogRequestDto dto)
    {
        var result = await _logParser.ParseLogAndCorrelateAsync(repoId, dto.RawLog);
        return Ok(result);
    }
}

[ApiController]
[Route("api/cicd")]
public class CiCdPipelineController : ControllerBase
{
    private readonly CiCdPipelineGeneratorService _pipelineGenerator;

    public CiCdPipelineController(CiCdPipelineGeneratorService pipelineGenerator)
    {
        _pipelineGenerator = pipelineGenerator;
    }

    [HttpGet("{repoId}/export")]
    public async Task<IActionResult> ExportPipeline(string repoId, [FromQuery] string? platform)
    {
        var result = await _pipelineGenerator.GenerateCiCdPipelineAsync(platform ?? "GitHub Actions", repoId);
        return Ok(result);
    }
}
