using System;

namespace RepoMind.Domain.Models;

public class DatabaseReference
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string RepositoryId { get; set; } = string.Empty;
    public string TableName { get; set; } = string.Empty;
    public string Operation { get; set; } = "READ"; // READ, WRITE, QUERY
    public string OrmProvider { get; set; } = "EF Core"; // EF Core, Dapper, Raw SQL
    public string SourceEntity { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public int LineNumber { get; set; }
}
