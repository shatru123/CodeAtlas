using System;

namespace RepoMind.Domain.Models;

public class CodeRelationship
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string RepositoryId { get; set; } = string.Empty;
    public string SourceEntityId { get; set; } = string.Empty;
    public string SourceFullName { get; set; } = string.Empty;
    public string? TargetEntityId { get; set; }
    public string TargetFullName { get; set; } = string.Empty;
    public RelationshipType Type { get; set; }
    public string? Context { get; set; }
    public string? FilePath { get; set; }
    public int? LineNumber { get; set; }
}
