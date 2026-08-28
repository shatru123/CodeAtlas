using System;
using System.Collections.Generic;

namespace CodeAtlas.Domain.Models;

public class RcaAnalysisResult
{
    public Guid AnalysisId { get; set; } = Guid.NewGuid();
    public string StackTrace { get; set; } = string.Empty;
    public string TargetSymbol { get; set; } = string.Empty;
    public string TargetFile { get; set; } = string.Empty;
    public int LineNumber { get; set; }
    public string LikelyRootCause { get; set; } = string.Empty;
    public string RegressingCommitHash { get; set; } = string.Empty;
    public string RegressingAuthor { get; set; } = string.Empty;
    public string CommitMessage { get; set; } = string.Empty;
    public double ConfidenceScore { get; set; } = 0.94;
    public List<Evidence> EvidenceTrail { get; set; } = new();
    public List<string> AffectedServices { get; set; } = new();
}

public class EngineeringHealthRadar
{
    public int ArchitectureScore { get; set; } = 82;
    public int SecurityScore { get; set; } = 91;
    public int DependencyScore { get; set; } = 76;
    public int TestingScore { get; set; } = 68;
    public int ObservabilityScore { get; set; } = 54;
    public int DocumentationScore { get; set; } = 43;
    public int ComplexityScore { get; set; } = 71;
    public int OverallScore { get; set; } = 69;
    public List<PrioritizedTechDebtItem> DebtMatrix { get; set; } = new();
}

public class PrioritizedTechDebtItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string TargetFile { get; set; } = string.Empty;
    public int PriorityScore { get; set; } // Calculated: Impact * Risk * Usage * Frequency
    public string RiskLevel { get; set; } = "HIGH";
    public string UsageFrequency { get; set; } = "VERY HIGH";
    public string EstimatedEffort { get; set; } = "2 days";
    public string RecommendedAction { get; set; } = string.Empty;
}

public class McpRpcRequest
{
    public string Jsonrpc { get; set; } = "2.0";
    public string Method { get; set; } = string.Empty;
    public Dictionary<string, object>? Params { get; set; }
    public object? Id { get; set; }
}

public class McpRpcResponse
{
    public string Jsonrpc { get; set; } = "2.0";
    public object? Result { get; set; }
    public object? Error { get; set; }
    public object? Id { get; set; }
}

public class CrossRepoTopology
{
    public List<CrossRepoNode> Services { get; set; } = new();
    public List<CrossRepoEdge> Connections { get; set; } = new();
}

public class CrossRepoNode
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Language { get; set; } = ".NET C#";
    public int EntitiesCount { get; set; }
    public int ApisCount { get; set; }
    public string Status { get; set; } = "Healthy";
}

public class CrossRepoEdge
{
    public string SourceRepoId { get; set; } = string.Empty;
    public string TargetRepoId { get; set; } = string.Empty;
    public string Protocol { get; set; } = "REST / gRPC";
    public string EndpointRoute { get; set; } = string.Empty;
}
