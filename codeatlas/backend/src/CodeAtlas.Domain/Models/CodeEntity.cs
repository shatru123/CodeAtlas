using System;
using System.Collections.Generic;

namespace CodeAtlas.Domain.Models;

public class CodeEntity
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string RepositoryId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Namespace { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public int StartLine { get; set; }
    public int EndLine { get; set; }
    public EntityType Type { get; set; }
    public string Language { get; set; } = "C#";
    public string? DocComment { get; set; }
    public List<string> Attributes { get; set; } = new();
    public Dictionary<string, string> Metadata { get; set; } = new();
}
