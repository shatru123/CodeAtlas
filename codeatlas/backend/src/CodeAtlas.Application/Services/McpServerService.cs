using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Services;

public class McpServerService
{
    private readonly IAgentToolRegistry _toolRegistry;
    private readonly IKnowledgeStore _knowledgeStore;

    public McpServerService(IAgentToolRegistry toolRegistry, IKnowledgeStore knowledgeStore)
    {
        _toolRegistry = toolRegistry;
        _knowledgeStore = knowledgeStore;
    }

    public async Task<McpRpcResponse> HandleRpcAsync(McpRpcRequest request)
    {
        if (request.Method.Equals("tools/list", StringComparison.OrdinalIgnoreCase))
        {
            var tools = _toolRegistry.GetAllTools().Select(t => new
            {
                name = $"codeatlas.{t.Name}",
                description = t.Description,
                category = t.Category,
                inputSchema = new { type = "object" }
            });

            return new McpRpcResponse
            {
                Id = request.Id,
                Result = new { tools }
            };
        }

        if (request.Method.Equals("tools/call", StringComparison.OrdinalIgnoreCase))
        {
            var toolName = request.Params?.GetValueOrDefault("name")?.ToString()?.Replace("codeatlas.", "") ?? "";
            var tool = _toolRegistry.GetTool(toolName);
            if (tool == null)
            {
                return new McpRpcResponse
                {
                    Id = request.Id,
                    Error = new { code = -32601, message = $"Tool '{toolName}' not found in CodeAtlas registry." }
                };
            }

            var args = request.Params?.GetValueOrDefault("arguments") as Dictionary<string, object> ?? new();
            var result = await tool.ExecuteAsync(Environment.CurrentDirectory, args);
            return new McpRpcResponse
            {
                Id = request.Id,
                Result = new { content = new[] { new { type = "text", text = result.Output } } }
            };
        }

        return new McpRpcResponse
        {
            Id = request.Id,
            Error = new { code = -32601, message = $"Method '{request.Method}' not supported." }
        };
    }
}
