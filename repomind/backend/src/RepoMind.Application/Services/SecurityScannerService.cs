using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using RepoMind.Domain.Models;

namespace RepoMind.Application.Services;

public class SecurityScannerService
{
    private static readonly List<(string Package, string VersionPattern, string Cve, SeverityLevel Severity, string Summary, string Rec)> KnownCves = new()
    {
        ("Newtonsoft.Json", "12.", "CVE-2024-21907", SeverityLevel.High, "Improper handling of high-depth JSON objects causing stack overflow", "Upgrade to Newtonsoft.Json >= 13.0.1"),
        ("System.Text.Json", "7.0.0", "CVE-2024-30105", SeverityLevel.High, "Denial of Service in System.Text.Json deserialization", "Upgrade to System.Text.Json >= 8.0.4"),
        ("axios", "0.21.1", "CVE-2023-45857", SeverityLevel.Medium, "Server-Side Request Forgery (SSRF) vulnerability", "Upgrade to axios >= 1.7.4"),
        ("express", "4.16.", "CVE-2024-29041", SeverityLevel.High, "Open redirect vulnerability in express.js", "Upgrade to express >= 4.19.2"),
        ("lodash", "4.17.15", "CVE-2021-23337", SeverityLevel.High, "Command Injection via template function in lodash", "Upgrade to lodash >= 4.17.21"),
        ("requests", "2.25.1", "CVE-2023-32681", SeverityLevel.Medium, "Proxy-Authorization header leak in Python requests", "Upgrade to requests >= 2.31.0"),
    };

    private static readonly List<(string Type, string Regex, SeverityLevel Severity)> SecretPatterns = new()
    {
        ("AWS Access Key ID", @"AKIA[0-9A-Z]{16}", SeverityLevel.Critical),
        ("JWT Secret Key", @"(?i)(jwt_secret|jwtsecret)\s*[:=]\s*[""']([^""']{8,})[""']", SeverityLevel.High),
        ("Database Connection String Password", @"(?i)(password|pwd)=([^;""'\s]{4,})", SeverityLevel.High),
        ("RSA Private Key", @"-----BEGIN (RSA |EC |)PRIVATE KEY-----", SeverityLevel.Critical),
        ("GitHub Personal Access Token", @"ghp_[a-zA-Z0-9]{36}", SeverityLevel.Critical),
    };

    public static Task<SecurityAuditResult> AuditRepositoryAsync(string repoRootPath, AnalysisResult result)
    {
        var audit = new SecurityAuditResult
        {
            RepositoryId = result.Repository.Id
        };

        // 1. Audit Package CVE Vulnerabilities
        foreach (var pkg in result.Packages)
        {
            var match = KnownCves.FirstOrDefault(c =>
                c.Package.Equals(pkg.PackageName, StringComparison.OrdinalIgnoreCase) &&
                (string.IsNullOrEmpty(pkg.Version) || pkg.Version.Contains(c.VersionPattern)));

            if (match != default)
            {
                audit.Vulnerabilities.Add(new SecurityVulnerability
                {
                    PackageName = pkg.PackageName,
                    Version = pkg.Version,
                    CveId = match.Cve,
                    Severity = match.Severity,
                    Summary = match.Summary,
                    Recommendation = match.Rec,
                    FilePath = pkg.FilePath
                });
            }
        }

        // 2. Audit Codebase for Hardcoded Secret Leaks
        if (Directory.Exists(repoRootPath))
        {
            try
            {
                var files = Directory.GetFiles(repoRootPath, "*.*", SearchOption.AllDirectories)
                    .Where(f => !f.Contains($"{Path.DirectorySeparatorChar}.git{Path.DirectorySeparatorChar}") &&
                                !f.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}") &&
                                !f.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}") &&
                                !f.Contains($"{Path.DirectorySeparatorChar}node_modules{Path.DirectorySeparatorChar}"))
                    .Take(250);

                foreach (var file in files)
                {
                    var relativePath = Path.GetRelativePath(repoRootPath, file);
                    var lines = File.ReadAllLines(file);
                    for (int i = 0; i < lines.Length; i++)
                    {
                        var line = lines[i];
                        foreach (var secret in SecretPatterns)
                        {
                            var match = Regex.Match(line, secret.Regex);
                            if (match.Success)
                            {
                                var rawValue = match.Value;
                                var masked = rawValue.Length > 8
                                    ? $"{rawValue.Substring(0, 4)}****{rawValue.Substring(rawValue.Length - 4)}"
                                    : "****";

                                audit.SecretLeaks.Add(new SecretLeak
                                {
                                    SecretType = secret.Type,
                                    MaskedValue = masked,
                                    FilePath = relativePath,
                                    LineNumber = i + 1,
                                    Severity = secret.Severity
                                });
                            }
                        }
                    }
                }
            }
            catch { }
        }

        // 3. Audit OWASP API Security Rules
        foreach (var api in result.Apis)
        {
            var controllerEntity = result.Entities.FirstOrDefault(e => e.Name == api.ControllerName || e.FullName.EndsWith(api.ControllerName));
            if (controllerEntity != null && controllerEntity.Attributes.Any(a => a.Contains("AllowAnonymous")))
            {
                audit.OwaspViolations.Add(new OwaspApiViolation
                {
                    Route = api.Route,
                    HttpMethod = api.HttpMethod,
                    RuleId = "OWASP-API2:2023",
                    Description = $"Endpoint {api.HttpMethod} {api.Route} permits unauthenticated public access via [AllowAnonymous]",
                    FilePath = api.FilePath,
                    LineNumber = api.LineNumber
                });
            }
        }

        // 4. Calculate Security Score (100 minus penalty deductions)
        int penalty = (audit.Vulnerabilities.Count * 12) + (audit.SecretLeaks.Count * 20) + (audit.OwaspViolations.Count * 8);
        audit.SecurityScore = Math.Max(0, 100 - penalty);

        return Task.FromResult(audit);
    }
}
