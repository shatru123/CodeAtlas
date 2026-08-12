using System.Collections.Generic;
using System.Threading.Tasks;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Abstractions;

public interface ILanguageParser
{
    string LanguageName { get; }
    bool CanParse(string filePath);
    Task ParseFileAsync(
        string repoId,
        string relativePath,
        string fullPath,
        string sourceCode,
        List<CodeEntity> entities,
        List<CodeRelationship> relationships,
        List<ApiDefinition> apis,
        List<DatabaseReference> dbs,
        List<EventDefinition> events,
        List<string> errors);
}

public interface ITechStackDetector
{
    Task<List<string>> DetectTechStackAsync(string repoRootPath);
    Task<List<string>> DetectLanguagesAsync(string repoRootPath);
    Task<List<PackageDependency>> ExtractPackagesAsync(string repoRootPath, string repoId);
}

public interface IGitMetadataExtractor
{
    Task<(string branch, string commitHash, string author, string message, List<GitCommitInfo> recentCommits)> ExtractGitInfoAsync(string repoRootPath);
    Task<string> CloneOrPullRepoAsync(string gitUrl, string targetDirectory, string? branch = null, string? commit = null, string? accessToken = null);
}

public interface IKnowledgeStore
{
    Task SaveAnalysisAsync(AnalysisResult result);
    Task<AnalysisResult?> GetAnalysisAsync(string repositoryId);
    Task<List<RepositoryInfo>> ListRepositoriesAsync();
}

public interface IRepositoryScanner
{
    Task<AnalysisResult> ScanLocalRepositoryAsync(string localPath);
    Task<AnalysisResult> ScanGitHubRepositoryAsync(string gitUrl, string? branch = null, string? commit = null, string? accessToken = null);
    Task<AnalysisResult> ScanRepositoryAsync(string pathOrUrl);
}
