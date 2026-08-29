using System;
using System.Collections.Generic;

namespace CodeAtlas.Domain.Models;

public class UnitTestSuiteResult
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string TargetClassName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string Framework { get; set; } = "xUnit + Moq"; // xUnit + Moq, NUnit, Jest
    public string TestCode { get; set; } = string.Empty;
    public List<string> MockedDependencies { get; set; } = new();
    public int GeneratedTestCasesCount { get; set; } = 4;
    public string Rationale { get; set; } = string.Empty;
}

public class ArchitectureViolationRule
{
    public string RuleId { get; set; } = string.Empty;
    public string RuleName { get; set; } = string.Empty;
    public string Category { get; set; } = "Layer Dependency Violation"; // Layer Dependency, Naming Convention, Circular Dependency
    public string Severity { get; set; } = "HIGH"; // HIGH, MEDIUM, LOW
    public string Description { get; set; } = string.Empty;
    public string ViolatingSymbol { get; set; } = string.Empty;
    public string SourceFile { get; set; } = string.Empty;
    public string RemediationHint { get; set; } = string.Empty;
}

public class ArchitectureComplianceReport
{
    public string RepositoryId { get; set; } = string.Empty;
    public int ComplianceScore { get; set; } = 92;
    public int TotalRulesEvaluated { get; set; } = 12;
    public int TotalViolations { get; set; } = 2;
    public List<ArchitectureViolationRule> Violations { get; set; } = new();
}

public class SupplyChainVulnerability
{
    public string PackageName { get; set; } = string.Empty;
    public string InstalledVersion { get; set; } = string.Empty;
    public string RecommendedVersion { get; set; } = string.Empty;
    public string CveId { get; set; } = string.Empty;
    public string Severity { get; set; } = "HIGH"; // CRITICAL, HIGH, MEDIUM, LOW
    public string LicenseType { get; set; } = "MIT"; // MIT, Apache-2.0, GPL-3.0
    public bool IsLicenseCompliant { get; set; } = true;
    public string Summary { get; set; } = string.Empty;
    public string Action { get; set; } = "Upgrade package to safe version";
}

public class TelemetryLogIncidentResult
{
    public string IncidentId { get; set; } = Guid.NewGuid().ToString("N");
    public string RawLog { get; set; } = string.Empty;
    public string ErrorType { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
    public string MatchedFile { get; set; } = string.Empty;
    public string MatchedSymbol { get; set; } = string.Empty;
    public int ErrorLineNumber { get; set; } = 0;
    public string RegressingCommit { get; set; } = string.Empty;
    public string RegressingAuthor { get; set; } = string.Empty;
    public string ProposedFixPatch { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
}

public class CiCdPipelineConfigResult
{
    public string Platform { get; set; } = "GitHub Actions"; // GitHub Actions, GitLab CI, Docker Compose
    public string OutputFilePath { get; set; } = ".github/workflows/codeatlas-ci.yml";
    public string GeneratedContent { get; set; } = string.Empty;
    public List<string> FeaturesIncluded { get; set; } = new();
    public string ExecutionGuide { get; set; } = string.Empty;
}
