using System;

namespace CodeAtlas.Domain.Models;

public class PackageDependency
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string RepositoryId { get; set; } = string.Empty;
    public string PackageName { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public string Ecosystem { get; set; } = "NuGet"; // NuGet, NPM, PyPI, Maven, Go
    public string FilePath { get; set; } = string.Empty;
}
