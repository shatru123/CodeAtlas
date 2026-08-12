using System;
using System.Collections.Generic;

namespace RepoMind.Domain.Models;

public class AffectedComponentInfo
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string Context { get; set; } = string.Empty;
}

public class BlastRadiusResult
{
    public string TargetEntityName { get; set; } = string.Empty;
    public int ImpactScore { get; set; } // 0 to 100
    public string RiskLevel { get; set; } = "Low"; // Low, Medium, High, Critical
    public List<AffectedComponentInfo> AffectedControllers { get; set; } = new();
    public List<AffectedComponentInfo> AffectedServices { get; set; } = new();
    public List<AffectedComponentInfo> AffectedRepositories { get; set; } = new();
    public List<AffectedComponentInfo> AffectedDatabases { get; set; } = new();
    public List<AffectedComponentInfo> AffectedCrossRepoServices { get; set; } = new();
}

public class BranchDiffResult
{
    public string SourceBranch { get; set; } = "main";
    public string TargetBranch { get; set; } = "feature";
    public List<ApiDefinition> AddedApis { get; set; } = new();
    public List<ApiDefinition> RemovedApis { get; set; } = new();
    public List<CodeEntity> AddedEntities { get; set; } = new();
    public List<CodeEntity> RemovedEntities { get; set; } = new();
    public List<CodeRelationship> NewViolationsIntroduced { get; set; } = new();
}

public class DatabaseTableColumn
{
    public string ColumnName { get; set; } = string.Empty;
    public string DataType { get; set; } = "string";
    public bool IsPrimaryKey { get; set; }
    public bool IsForeignKey { get; set; }
}

public class DatabaseTableSchema
{
    public string TableName { get; set; } = string.Empty;
    public string OrmProvider { get; set; } = "EF Core";
    public List<DatabaseTableColumn> Columns { get; set; } = new();
}

public class DatabaseErdResult
{
    public int TotalTables { get; set; }
    public string MermaidErdMarkup { get; set; } = string.Empty;
    public List<DatabaseTableSchema> Tables { get; set; } = new();
}

public class ContainerServiceInfo
{
    public string ServiceName { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public List<string> Ports { get; set; } = new();
    public List<string> EnvironmentVariables { get; set; } = new();
    public string SourceFile { get; set; } = string.Empty;
}

public class InfrastructureTopology
{
    public int DockerfilesCount { get; set; }
    public int K8sManifestsCount { get; set; }
    public List<ContainerServiceInfo> ContainerServices { get; set; } = new();
}

public class ArchitectureHandbook
{
    public string RepositoryName { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public string MarkdownContent { get; set; } = string.Empty;
}
