using System;
using System.Collections.Generic;

namespace RepoMind.Domain.Models;

public class GitCommitInfo
{
    public string CommitHash { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime CommittedAt { get; set; }
    public List<string> ModifiedFiles { get; set; } = new();
}

public class RepositoryInfo
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string RootPath { get; set; } = string.Empty;
    public RepositorySource Source { get; set; } = RepositorySource.Local;
    public string Branch { get; set; } = "main";
    public string CommitHash { get; set; } = string.Empty;
    public string LastCommitMessage { get; set; } = string.Empty;
    public string LastCommitAuthor { get; set; } = string.Empty;
    public DateTime? LastIndexedAt { get; set; }
    public ExtractionStatus Status { get; set; } = ExtractionStatus.Pending;
    public List<string> Languages { get; set; } = new();
    public List<string> TechStack { get; set; } = new();
    public string? ErrorMessage { get; set; }
}
