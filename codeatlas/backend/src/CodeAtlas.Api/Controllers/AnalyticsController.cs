using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CodeAtlas.Application.Services;

namespace CodeAtlas.Api.Controllers
{
    [ApiController]
    [Route("api/analytics")]
    public class AnalyticsController : ControllerBase
    {
        private readonly VisitorTrackerService _visitorService;

        public AnalyticsController(VisitorTrackerService visitorService)
        {
            _visitorService = visitorService;
        }

        public class RecordVisitRequest
        {
            public string Referrer { get; set; }
            public string Email { get; set; }
        }

        [HttpPost("visit")]
        public async Task<IActionResult> RecordVisit([FromBody] RecordVisitRequest request)
        {
            var ip = HttpContext.Request.Headers["X-Forwarded-For"].ToString();
            if (string.IsNullOrWhiteSpace(ip))
            {
                ip = HttpContext.Request.Headers["X-Real-IP"].ToString();
            }
            if (string.IsNullOrWhiteSpace(ip))
            {
                ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            }

            var userAgent = HttpContext.Request.Headers["User-Agent"].ToString();
            var log = await _visitorService.RecordVisitAsync(ip, userAgent, request?.Referrer, request?.Email);

            return Ok(new
            {
                success = true,
                visitorId = log.Id,
                country = log.Country,
                city = log.City,
                isUnique = log.IsUnique
            });
        }

        [HttpGet("dashboard")]
        public IActionResult GetDashboard([FromQuery] string adminPin)
        {
            try
            {
                var summary = _visitorService.GetDashboardSummary(adminPin);
                return Ok(summary);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
