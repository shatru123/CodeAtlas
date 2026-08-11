using System;
using System.Collections.Generic;

namespace RepoMind.Domain.Models;

public class FunctionalFlowStep
{
    public int StepNumber { get; set; }
    public string NodeName { get; set; } = string.Empty;
    public string NodeType { get; set; } = "Step"; // API, Controller, Service, Repository, Database, Event, Consumer
    public string Description { get; set; } = string.Empty;
    public string? FilePath { get; set; }
    public int? LineNumber { get; set; }
}

public class FunctionalFlow
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string RepositoryId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TriggerApi { get; set; } = string.Empty;
    public List<FunctionalFlowStep> Steps { get; set; } = new();
    public string MermaidMarkup { get; set; } = string.Empty;
}
