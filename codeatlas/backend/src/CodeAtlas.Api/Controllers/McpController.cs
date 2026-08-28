using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CodeAtlas.Application.Services;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class McpController : ControllerBase
{
    private readonly McpServerService _mcpService;

    public McpController(McpServerService mcpService)
    {
        _mcpService = mcpService;
    }

    [HttpPost("rpc")]
    public async Task<IActionResult> HandleRpc([FromBody] McpRpcRequest request)
    {
        var response = await _mcpService.HandleRpcAsync(request);
        return Ok(response);
    }
}
