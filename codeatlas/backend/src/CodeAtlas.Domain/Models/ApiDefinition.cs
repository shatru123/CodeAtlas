using System;

namespace CodeAtlas.Domain.Models;

public class ApiDefinition
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string RepositoryId { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public string HttpMethod { get; set; } = "GET";
    public string ControllerName { get; set; } = string.Empty;
    public string ActionName { get; set; } = string.Empty;
    public string? RequestModel { get; set; }
    public string? ResponseModel { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public int LineNumber { get; set; }
}
