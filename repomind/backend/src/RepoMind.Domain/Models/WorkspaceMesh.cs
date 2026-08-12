using System;
using System.Collections.Generic;

namespace RepoMind.Domain.Models;

public class CrossRepoDependency
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string SourceRepoId { get; set; } = string.Empty;
    public string SourceRepoName { get; set; } = string.Empty;
    public string SourceComponent { get; set; } = string.Empty;
    public string TargetRepoId { get; set; } = string.Empty;
    public string TargetRepoName { get; set; } = string.Empty;
    public string TargetComponent { get; set; } = string.Empty;
    public string DependencyType { get; set; } = "REST_HTTP"; // REST_HTTP, EVENT_MESSAGE, SHARED_DB
    public string Protocol { get; set; } = "HTTP/JSON";
    public string Context { get; set; } = string.Empty;
}

public class WorkspaceMeshSummary
{
    public int TotalRepositories { get; set; }
    public int TotalCrossRepoDependencies { get; set; }
    public List<CrossRepoDependency> Dependencies { get; set; } = new();
    public List<RepositoryInfo> Repositories { get; set; } = new();
}
