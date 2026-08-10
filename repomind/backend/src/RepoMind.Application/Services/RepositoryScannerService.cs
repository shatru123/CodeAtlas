using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using RepoMind.Application.Abstractions;
using RepoMind.Domain.Models;

namespace RepoMind.Application.Services;

public class RepositoryScannerService : IRepositoryScanner
{
    private readonly IEnumerable<ILanguageParser> _parsers;
    private readonly ITechStackDetector _techStackDetector;
    private readonly IGitMetadataExtractor _gitExtractor;
    private readonly IKnowledgeStore _knowledgeStore;

    private static readonly HashSet<string> ExcludedDirectories = new(StringComparer.OrdinalIgnoreCase)
    {
        ".git", ".vs", ".vscode", "bin", "obj", "node_modules", "venv", ".idea", "dist", "build", "coverage", ".dotnet"
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

    public async Task<AnalysisResult> ScanRepositoryAsync(string localPath)
    {
        if (!Directory.Exists(localPath))
        {
            throw new DirectoryNotFoundException($"Repository path not found: {localPath}");
        }

        var fullPath = Path.GetFullPath(localPath);
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
            Source = RepositorySource.Local,
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

            // Infer Architectural Relationships & Violations
            DetectArchitecturalPatternsAndViolations(result);

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
        // Detect Controller -> DB bypass violation
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
