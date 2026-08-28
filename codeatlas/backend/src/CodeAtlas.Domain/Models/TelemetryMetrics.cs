using System;
using System.Collections.Generic;

namespace CodeAtlas.Domain.Models
{
    public class TelemetryMetrics
    {
        public List<ApiEndpointTelemetry> ApiMetrics { get; set; } = new List<ApiEndpointTelemetry>();
        public List<DatabaseQueryTelemetry> DatabaseMetrics { get; set; } = new List<DatabaseQueryTelemetry>();
        public int TotalRequestsPerMin { get; set; } = 1450;
        public double AverageLatencyMs { get; set; } = 42.5;
        public double ErrorRatePercentage { get; set; } = 0.4;
    }

    public class ApiEndpointTelemetry
    {
        public string Route { get; set; } = string.Empty;
        public string HttpMethod { get; set; } = "GET";
        public double P95LatencyMs { get; set; }
        public double P99LatencyMs { get; set; }
        public int RequestsPerMinute { get; set; }
        public double ErrorRatePercentage { get; set; }
        public string Status { get; set; } = "Optimal"; // "Optimal", "Warning", "Critical"
        public bool HasNPlusOneWarning { get; set; }
    }

    public class DatabaseQueryTelemetry
    {
        public string TableOrEntity { get; set; } = string.Empty;
        public int QueryCountPerMin { get; set; }
        public double AvgDurationMs { get; set; }
        public bool IsNPlusOneBottleneck { get; set; }
        public string Severity { get; set; } = "Low";
    }
}
