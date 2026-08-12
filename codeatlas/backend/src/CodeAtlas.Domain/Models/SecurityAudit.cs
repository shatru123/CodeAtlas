using System;
using System.Collections.Generic;

namespace CodeAtlas.Domain.Models;

public enum SeverityLevel
{
    Low = 0,
    Medium = 1,
    High = 2,
    Critical = 3
}

public class SecurityVulnerability
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string PackageName { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string CveId { get; set; } = string.Empty;
    public SeverityLevel Severity { get; set; } = SeverityLevel.Medium;
    public string Summary { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
}

public class SecretLeak
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string SecretType { get; set; } = string.Empty; // AWS Access Key, JWT Secret, DB Password, RSA Private Key
    public string MaskedValue { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public int LineNumber { get; set; }
    public SeverityLevel Severity { get; set; } = SeverityLevel.High;
}

public class OwaspApiViolation
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Route { get; set; } = string.Empty;
    public string HttpMethod { get; set; } = string.Empty;
    public string RuleId { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public int LineNumber { get; set; }
}

public class SecurityAuditResult
{
    public string RepositoryId { get; set; } = string.Empty;
    public int SecurityScore { get; set; } = 100; // 0 to 100
    public List<SecurityVulnerability> Vulnerabilities { get; set; } = new();
    public List<SecretLeak> SecretLeaks { get; set; } = new();
    public List<OwaspApiViolation> OwaspViolations { get; set; } = new();
}
