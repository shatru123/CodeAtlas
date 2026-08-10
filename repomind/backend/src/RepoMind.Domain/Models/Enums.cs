namespace RepoMind.Domain.Models;

public enum EntityType
{
    Namespace,
    Class,
    Interface,
    Struct,
    Enum,
    Record,
    Method,
    Property,
    Field,
    Controller,
    Service,
    Repository,
    Model,
    DTO,
    Entity,
    Middleware,
    Worker,
    Consumer,
    Producer,
    Configuration
}

public enum RelationshipType
{
    Contains,
    Calls,
    Implements,
    Inherits,
    DependsOn,
    Exposes,
    Consumes,
    Publishes,
    ReadsFrom,
    WritesTo,
    Uses,
    ConfiguredBy,
    TestedBy,
    ModifiedBy,
    PartOf
}

public enum RepositorySource
{
    Local,
    GitHub
}

public enum ExtractionStatus
{
    Pending,
    InProgress,
    Completed,
    Failed
}
