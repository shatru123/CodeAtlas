using System;
using System.Collections.Generic;

namespace CodeAtlas.Domain.Models;

public class AiCodeReviewComment
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string FilePath { get; set; } = string.Empty;
    public int LineNumber { get; set; } = 1;
    public string Severity { get; set; } = "CRITICAL"; // CRITICAL, WARNING, SUGGESTION
    public string Category { get; set; } = "Security Risk"; // Security, Performance, Readability, Architecture
    public string Description { get; set; } = string.Empty;
    public string SuggestedCodeFix { get; set; } = string.Empty;
}

public class AiCodeReviewReport
{
    public string RepositoryId { get; set; } = string.Empty;
    public int QualityScore { get; set; } = 88;
    public string RiskRating { get; set; } = "LOW";
    public int TotalIssuesFound { get; set; } = 3;
    public List<AiCodeReviewComment> Comments { get; set; } = new();
}

public class ApiSchemaDiffItem
{
    public string ApiRoute { get; set; } = string.Empty;
    public string HttpMethod { get; set; } = "GET";
    public string ChangeType { get; set; } = "BREAKING"; // BREAKING, BACKWARDS_COMPATIBLE
    public string Description { get; set; } = string.Empty;
    public string ImpactedClients { get; set; } = string.Empty;
}

public class ApiBreakingChangeReport
{
    public string RepositoryId { get; set; } = string.Empty;
    public int TotalApisScanned { get; set; } = 12;
    public int BreakingChangesCount { get; set; } = 1;
    public List<ApiSchemaDiffItem> Diffs { get; set; } = new();
}

public class CloudResourceCostItem
{
    public string ResourceName { get; set; } = string.Empty;
    public string ResourceType { get; set; } = "Database"; // Database, Container, Caching, Storage
    public double MonthlyCostUsd { get; set; } = 49.00;
    public string SizingSpec { get; set; } = "2 vCPU / 4GB RAM";
    public string OptimizationTip { get; set; } = string.Empty;
}

public class CloudFinOpsReport
{
    public string RepositoryId { get; set; } = string.Empty;
    public double TotalEstimatedMonthlyCostUsd { get; set; } = 185.00;
    public string PrimaryCloudProvider { get; set; } = "AWS / Docker Cloud";
    public List<CloudResourceCostItem> Resources { get; set; } = new();
}

public class ApiPlaygroundRequest
{
    public string Method { get; set; } = "GET";
    public string Url { get; set; } = string.Empty;
    public string PayloadJson { get; set; } = "{}";
    public Dictionary<string, string> Headers { get; set; } = new();
}

public class ApiPlaygroundResponse
{
    public int StatusCode { get; set; } = 200;
    public string StatusText { get; set; } = "OK";
    public long DurationMs { get; set; } = 42;
    public string ResponseBodyJson { get; set; } = "{}";
    public Dictionary<string, string> ResponseHeaders { get; set; } = new();
}

public class VisualArchNode
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string NodeType { get; set; } = "Controller"; // Controller, Service, Database, Queue, ExternalService
    public string FilePath { get; set; } = string.Empty;
    public List<string> Targets { get; set; } = new();
}

public class VisualArchCanvasResult
{
    public string RepositoryId { get; set; } = string.Empty;
    public List<VisualArchNode> Nodes { get; set; } = new();
}
