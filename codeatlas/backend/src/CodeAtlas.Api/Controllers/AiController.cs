using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CodeAtlas.Api.Dtos;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Application.Services;

namespace CodeAtlas.Api.Controllers
{
    [ApiController]
    [Route("api/repositories/{id}/ai")]
    public class AiController : ControllerBase
    {
        private readonly IKnowledgeStore _knowledgeStore;
        private readonly GeminiAiService _aiService;

        public AiController(IKnowledgeStore knowledgeStore, GeminiAiService aiService)
        {
            _knowledgeStore = knowledgeStore;
            _aiService = aiService;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> AskAi([FromRoute] string id, [FromBody] AiChatRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request?.Prompt))
            {
                return BadRequest(new { error = "Prompt cannot be empty." });
            }

            var analysis = await _knowledgeStore.GetAnalysisAsync(id);
            if (analysis == null)
            {
                return NotFound(new { error = $"Repository '{id}' not found." });
            }

            try
            {
                var answer = await _aiService.AskCodebaseAsync(analysis, request.Prompt, request.ApiKey);
                return Ok(new
                {
                    repositoryId = id,
                    prompt = request.Prompt,
                    answer = answer,
                    timestamp = DateTime.UtcNow
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"AI Assistant Error: {ex.Message}" });
            }
        }
    }
}
