using System;
using System.Collections.Generic;

namespace CodeAtlas.Domain.Models;

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
    public int ImpactScore { get; set; } = 45;
    public string RiskLevel { get; set; } = "MEDIUM"; // Critical, High, Medium, Low
    public List<AffectedComponentInfo> AffectedControllers { get; set; } = new();
    public List<AffectedComponentInfo> AffectedServices { get; set; } = new();
    public List<AffectedComponentInfo> AffectedRepositories { get; set; } = new();
    public List<AffectedComponentInfo> AffectedDatabases { get; set; } = new();
    public List<AffectedComponentInfo> AffectedCrossRepoServices { get; set; } = new();
}

public class BranchDiffResult
{
    public string SourceBranch { get; set; } = "feature/codeatlas-3.0";
    public string CurrentBranch { get; set; } = "feature/codeatlas-3.0";
    public string TargetBranch { get; set; } = "main";
    public int AddedEntitiesCount { get; set; } = 4;
    public int ModifiedEntitiesCount { get; set; } = 2;
    public int DeletedEntitiesCount { get; set; } = 0;
    public List<string> AddedFiles { get; set; } = new();
    public List<string> ModifiedFiles { get; set; } = new();
    public List<CodeEntity> AddedEntities { get; set; } = new();
    public List<ApiDefinition> AddedApis { get; set; } = new();
    public List<CodeRelationship> NewViolationsIntroduced { get; set; } = new();
    public List<string> RiskAlerts { get; set; } = new();
}

public class DatabaseTableColumn
{
    public string ColumnName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DataType { get; set; } = string.Empty;
    public bool IsPrimaryKey { get; set; } = false;
    public bool IsForeignKey { get; set; } = false;
}

public class DatabaseTableSchema
{
    public string TableName { get; set; } = string.Empty;
    public string OrmProvider { get; set; } = "EF Core / PostgreSQL";
    public List<DatabaseTableColumn> Columns { get; set; } = new();
    public List<string> PrimaryKeys { get; set; } = new();
    public List<string> ForeignKeys { get; set; } = new();
}

public class DatabaseErdResult
{
    public string RepositoryId { get; set; } = string.Empty;
    public int TotalTables { get; set; } = 6;
    public List<DatabaseTableSchema> Tables { get; set; } = new();
    public string MermaidErdMarkup { get; set; } = string.Empty;
}

public class ArchitectureHandbook
{
    public string RepositoryName { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public string SystemOverview { get; set; } = string.Empty;
    public List<string> PrimaryServices { get; set; } = new();
    public List<string> ApisCatalog { get; set; } = new();
    public string MarkdownContent { get; set; } = string.Empty;
    public string GeneratedMarkdownHandbook { get; set; } = string.Empty;
}

public class ContainerServiceInfo
{
    public string ServiceName { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public List<string> Ports { get; set; } = new();
    public string SourceFile { get; set; } = string.Empty;
}

public class InfrastructureTopology
{
    public bool HasDocker { get; set; } = true;
    public bool HasKubernetes { get; set; } = false;
    public bool HasTerraform { get; set; } = false;
    public int DockerfilesCount { get; set; } = 1;
    public int K8sManifestsCount { get; set; } = 0;
    public List<ContainerServiceInfo> ContainerServices { get; set; } = new();
    public List<string> Containers { get; set; } = new();
    public List<string> CloudResources { get; set; } = new();
}
