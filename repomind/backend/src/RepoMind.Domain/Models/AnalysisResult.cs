using System.Collections.Generic;

namespace RepoMind.Domain.Models;

public class AnalysisResult
{
    public RepositoryInfo Repository { get; set; } = new();
    public List<CodeEntity> Entities { get; set; } = new();
    public List<CodeRelationship> Relationships { get; set; } = new();
    public List<ApiDefinition> Apis { get; set; } = new();
    public List<DatabaseReference> Databases { get; set; } = new();
    public List<EventDefinition> Events { get; set; } = new();
    public List<PackageDependency> Packages { get; set; } = new();
    public List<FunctionalFlow> Flows { get; set; } = new();
    public List<GitCommitInfo> RecentCommits { get; set; } = new();
    public List<string> ParsingErrors { get; set; } = new();
}
