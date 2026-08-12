using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Services;

public class RepositoryScannerService : IRepositoryScanner
{
    private readonly IEnumerable<ILanguageParser> _parsers;
    private readonly ITechStackDetector _techStackDetector;
    private readonly IGitMetadataExtractor _gitExtractor;
    private readonly IKnowledgeStore _knowledgeStore;

    private static readonly HashSet<string> ExcludedDirectories = new(StringComparer.OrdinalIgnoreCase)
    {
        ".git", ".vs", ".vscode", "bin", "obj", "node_modules", "venv", ".idea", "dist", "build", "coverage", ".dotnet", "clones"
    };

    public RepositoryScannerService(
        IEnumerable<ILanguageParser> parsers,
        ITechStackDetector techStackDetector,
        IGitMetadataExtractor gitExtractor,
        IKnowledgeStore knowledgeStore)
    {
        _parsers = parsers;
        _techStackDetector = techStackDetector;
        _gitExtractor = gitExtractor;
        _knowledgeStore = knowledgeStore;
    }

    public Task<AnalysisResult> ScanRepositoryAsync(string pathOrUrl)
    {
        if (IsGitUrl(pathOrUrl))
        {
            return ScanGitHubRepositoryAsync(pathOrUrl);
        }
        return ScanLocalRepositoryAsync(pathOrUrl);
    }

    public async Task<AnalysisResult> ScanLocalRepositoryAsync(string localPath)
    {
        var normalizedPath = NormalizePath(localPath);
        if (!Directory.Exists(normalizedPath))
        {
            throw new DirectoryNotFoundException($"Local repository directory not found: '{localPath}' (Resolved: '{normalizedPath}')");
        }

        return await PerformScanAsync(normalizedPath, RepositorySource.Local);
    }

    public async Task<AnalysisResult> ScanGitHubRepositoryAsync(string gitUrl, string? branch = null, string? commit = null, string? accessToken = null)
    {
        if (!IsGitUrl(gitUrl) && !gitUrl.Contains('/'))
        {
            // If passed "owner/repo", convert to GitHub URL
            gitUrl = $"https://github.com/{gitUrl.Trim()}";
        }

        var repoName = ExtractRepoNameFromUrl(gitUrl);
        var userProfile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        var cacheBaseDir = (!string.IsNullOrWhiteSpace(userProfile) && Directory.Exists(userProfile))
            ? Path.Combine(userProfile, ".codeatlas", "clones")
            : Path.Combine(Path.GetTempPath(), ".codeatlas", "clones");
        var cloneDir = Path.Combine(cacheBaseDir, repoName);

        var clonedPath = await _gitExtractor.CloneOrPullRepoAsync(gitUrl, cloneDir, branch, commit, accessToken);
        return await PerformScanAsync(clonedPath, RepositorySource.GitHub);
    }

    private async Task<AnalysisResult> PerformScanAsync(string fullPath, RepositorySource source)
    {
        var repoName = Path.GetFileName(fullPath.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar));
        if (string.IsNullOrWhiteSpace(repoName)) repoName = "Repository";

        var repoId = Guid.NewGuid().ToString("N");
        var (branch, commitHash, author, message, recentCommits) = await _gitExtractor.ExtractGitInfoAsync(fullPath);
        var techStack = await _techStackDetector.DetectTechStackAsync(fullPath);
        var languages = await _techStackDetector.DetectLanguagesAsync(fullPath);

        var repoInfo = new RepositoryInfo
        {
            Id = repoId,
            Name = repoName,
            RootPath = fullPath,
            Source = source,
            Branch = branch,
            CommitHash = commitHash,
            LastCommitMessage = message,
            LastCommitAuthor = author,
            LastIndexedAt = DateTime.UtcNow,
            Status = ExtractionStatus.InProgress,
            Languages = languages,
            TechStack = techStack
        };

        var result = new AnalysisResult
        {
            Repository = repoInfo,
            RecentCommits = recentCommits
        };

        try
        {
            var files = ScanFilesRecursively(fullPath);
            foreach (var filePath in files)
            {
                var relativePath = Path.GetRelativePath(fullPath, filePath);
                var parser = _parsers.FirstOrDefault(p => p.CanParse(filePath));
                if (parser != null)
                {
                    var sourceCode = await File.ReadAllTextAsync(filePath);
                    await parser.ParseFileAsync(
                        repoId,
                        relativePath,
                        filePath,
                        sourceCode,
                        result.Entities,
                        result.Relationships,
                        result.Apis,
                        result.Databases,
                        result.Events,
                        result.ParsingErrors);
                }
            }

            // Extract Third-Party Package Dependencies (NuGet, NPM, PyPI)
            result.Packages = await _techStackDetector.ExtractPackagesAsync(fullPath, repoId);

            // Infer Architectural Relationships & Violations
            DetectArchitecturalPatternsAndViolations(result);

            // Synthesize End-to-End Functional Flows & On-the-Fly Mermaid Diagrams
            result.Flows = FlowEngine.SynthesizeFlows(result);

            // Audit Security CVE Vulnerabilities, Secret Leaks, and OWASP Rules
            result.SecurityAudit = await SecurityScannerService.AuditRepositoryAsync(fullPath, result);

            repoInfo.Status = ExtractionStatus.Completed;
        }
        catch (Exception ex)
        {
            repoInfo.Status = ExtractionStatus.Failed;
            repoInfo.ErrorMessage = ex.Message;
            result.ParsingErrors.Add($"Scan failed: {ex.Message}");
        }

        await _knowledgeStore.SaveAnalysisAsync(result);
        return result;
    }

    private bool IsGitUrl(string pathOrUrl)
    {
        if (string.IsNullOrWhiteSpace(pathOrUrl)) return false;
        return pathOrUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
               pathOrUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase) ||
               pathOrUrl.StartsWith("git@", StringComparison.OrdinalIgnoreCase) ||
               pathOrUrl.EndsWith(".git", StringComparison.OrdinalIgnoreCase) ||
               pathOrUrl.Contains("github.com", StringComparison.OrdinalIgnoreCase);
    }

    private string NormalizePath(string path)
    {
        if (string.IsNullOrWhiteSpace(path)) return path;
        if (path.StartsWith("~"))
        {
            var home = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            path = Path.Combine(home, path.Substring(1).TrimStart('/', '\\'));
        }
        return Path.GetFullPath(path);
    }

    private string ExtractRepoNameFromUrl(string url)
    {
        var cleaned = url.TrimEnd('/', '\\');
        if (cleaned.EndsWith(".git", StringComparison.OrdinalIgnoreCase))
        {
            cleaned = cleaned.Substring(0, cleaned.Length - 4);
        }
        var lastSlash = cleaned.LastIndexOfAny(new[] { '/', '\\' });
        return lastSlash >= 0 ? cleaned.Substring(lastSlash + 1) : cleaned;
    }

    private IEnumerable<string> ScanFilesRecursively(string directory)
    {
        var files = new List<string>();
        try
        {
            foreach (var file in Directory.GetFiles(directory))
            {
                files.Add(file);
            }

            foreach (var subDir in Directory.GetDirectories(directory))
            {
                var dirName = Path.GetFileName(subDir);
                if (!ExcludedDirectories.Contains(dirName))
                {
                    files.AddRange(ScanFilesRecursively(subDir));
                }
            }
        }
        catch
        {
            // Ignore permission or file access errors during file scan
        }
        return files;
    }

    private void DetectArchitecturalPatternsAndViolations(AnalysisResult result)
    {
        var controllers = result.Entities.Where(e => e.Type == EntityType.Controller).ToList();
        var dbRefs = result.Databases;

        foreach (var controller in controllers)
        {
            var directDbCalls = dbRefs.Where(db => db.FilePath == controller.FilePath).ToList();
            foreach (var db in directDbCalls)
            {
                result.Relationships.Add(new CodeRelationship
                {
                    RepositoryId = result.Repository.Id,
                    SourceEntityId = controller.Id,
                    SourceFullName = controller.FullName,
                    TargetFullName = db.TableName,
                    Type = RelationshipType.ReadsFrom,
                    Context = "ARCHITECTURAL VIOLATION: Controller accessing DB directly bypassing Service layer",
                    FilePath = controller.FilePath,
                    LineNumber = db.LineNumber
                });
            }
        }
    }
}
