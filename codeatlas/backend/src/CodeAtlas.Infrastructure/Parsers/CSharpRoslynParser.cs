using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Infrastructure.Parsers;

public class CSharpRoslynParser : ILanguageParser
{
    public string LanguageName => "C#";

    public bool CanParse(string filePath)
    {
        return filePath.EndsWith(".cs", StringComparison.OrdinalIgnoreCase);
    }

    public Task ParseFileAsync(
        string repoId,
        string relativePath,
        string fullPath,
        string sourceCode,
        List<CodeEntity> entities,
        List<CodeRelationship> relationships,
        List<ApiDefinition> apis,
        List<DatabaseReference> dbs,
        List<EventDefinition> events,
        List<string> errors)
    {
        try
        {
            var tree = CSharpSyntaxTree.ParseText(sourceCode);
            var root = tree.GetRoot();

            // Extract namespace
            string currentNamespace = ExtractNamespace(root);

            // Extract Types (Classes, Interfaces, Structs, Enums, Records)
            var typeNodes = root.DescendantNodes().OfType<TypeDeclarationSyntax>();
            foreach (var typeNode in typeNodes)
            {
                var typeEntity = ProcessTypeDeclaration(repoId, relativePath, currentNamespace, typeNode, entities, relationships);

                // Check ASP.NET Core Controller APIs
                ProcessControllerApis(repoId, relativePath, typeNode, typeEntity, apis);

                // Check EF Core DbContext & MassTransit Consumers
                ProcessSpecialRoles(repoId, relativePath, typeNode, typeEntity, dbs, events);

                // Process Methods within Type
                var methodNodes = typeNode.Members.OfType<MethodDeclarationSyntax>();
                foreach (var methodNode in methodNodes)
                {
                    ProcessMethodDeclaration(repoId, relativePath, currentNamespace, typeEntity, methodNode, entities, relationships, dbs, events);
                }
            }
        }
        catch (Exception ex)
        {
            errors.Add($"Failed to parse {relativePath}: {ex.Message}");
        }

        return Task.CompletedTask;
    }

    private string ExtractNamespace(SyntaxNode root)
    {
        var fileScopedNs = root.DescendantNodes().OfType<FileScopedNamespaceDeclarationSyntax>().FirstOrDefault();
        if (fileScopedNs != null) return fileScopedNs.Name.ToString();

        var blockNs = root.DescendantNodes().OfType<NamespaceDeclarationSyntax>().FirstOrDefault();
        if (blockNs != null) return blockNs.Name.ToString();

        return "Global";
    }

    private CodeEntity ProcessTypeDeclaration(
        string repoId,
        string relativePath,
        string currentNamespace,
        TypeDeclarationSyntax typeNode,
        List<CodeEntity> entities,
        List<CodeRelationship> relationships)
    {
        var typeName = typeNode.Identifier.Text;
        var fullName = string.IsNullOrEmpty(currentNamespace) ? typeName : $"{currentNamespace}.{typeName}";
        var lineSpan = typeNode.SyntaxTree.GetLineSpan(typeNode.Span);

        var entityType = EntityType.Class;
        if (typeNode is InterfaceDeclarationSyntax)
        {
            entityType = EntityType.Interface;
        }
        else if (typeNode is StructDeclarationSyntax)
        {
            entityType = EntityType.Struct;
        }
        else if (typeNode is RecordDeclarationSyntax)
        {
            entityType = EntityType.Record;
        }
        else
        {
            if (typeName.EndsWith("Controller", StringComparison.OrdinalIgnoreCase)) entityType = EntityType.Controller;
            else if (typeName.EndsWith("Service", StringComparison.OrdinalIgnoreCase)) entityType = EntityType.Service;
            else if (typeName.EndsWith("Repository", StringComparison.OrdinalIgnoreCase)) entityType = EntityType.Repository;
            else if (typeName.EndsWith("Consumer", StringComparison.OrdinalIgnoreCase)) entityType = EntityType.Consumer;
            else if (typeName.EndsWith("Dto", StringComparison.OrdinalIgnoreCase) || typeName.EndsWith("Request", StringComparison.OrdinalIgnoreCase) || typeName.EndsWith("Response", StringComparison.OrdinalIgnoreCase)) entityType = EntityType.DTO;
        }

        var attributes = typeNode.AttributeLists
            .SelectMany(al => al.Attributes)
            .Select(a => a.Name.ToString())
            .ToList();

        var docComment = typeNode.GetLeadingTrivia()
            .Select(t => t.ToString().Trim())
            .FirstOrDefault(t => t.StartsWith("///"));

        var entity = new CodeEntity
        {
            RepositoryId = repoId,
            Name = typeName,
            FullName = fullName,
            Namespace = currentNamespace,
            FilePath = relativePath,
            StartLine = lineSpan.StartLinePosition.Line + 1,
            EndLine = lineSpan.EndLinePosition.Line + 1,
            Type = entityType,
            Language = "C#",
            DocComment = docComment,
            Attributes = attributes
        };

        entities.Add(entity);

        // Process Base Types & Interfaces (Inherits / Implements)
        if (typeNode.BaseList != null)
        {
            foreach (var baseType in typeNode.BaseList.Types)
            {
                var baseTypeName = baseType.Type.ToString();
                var relType = baseTypeName.StartsWith("I") && baseTypeName.Length > 1 && char.IsUpper(baseTypeName[1])
                    ? RelationshipType.Implements
                    : RelationshipType.Inherits;

                relationships.Add(new CodeRelationship
                {
                    RepositoryId = repoId,
                    SourceEntityId = entity.Id,
                    SourceFullName = entity.FullName,
                    TargetFullName = baseTypeName,
                    Type = relType,
                    FilePath = relativePath,
                    LineNumber = baseType.SyntaxTree.GetLineSpan(baseType.Span).StartLinePosition.Line + 1
                });
            }
        }

        // Process Constructor Dependency Injection
        var ctors = typeNode.Members.OfType<ConstructorDeclarationSyntax>();
        foreach (var ctor in ctors)
        {
            foreach (var param in ctor.ParameterList.Parameters)
            {
                var paramType = param.Type?.ToString();
                if (!string.IsNullOrEmpty(paramType))
                {
                    relationships.Add(new CodeRelationship
                    {
                        RepositoryId = repoId,
                        SourceEntityId = entity.Id,
                        SourceFullName = entity.FullName,
                        TargetFullName = paramType,
                        Type = RelationshipType.DependsOn,
                        Context = "Constructor Dependency Injection",
                        FilePath = relativePath,
                        LineNumber = param.SyntaxTree.GetLineSpan(param.Span).StartLinePosition.Line + 1
                    });
                }
            }
        }

        return entity;
    }

    private void ProcessMethodDeclaration(
        string repoId,
        string relativePath,
        string currentNamespace,
        CodeEntity parentType,
        MethodDeclarationSyntax methodNode,
        List<CodeEntity> entities,
        List<CodeRelationship> relationships,
        List<DatabaseReference> dbs,
        List<EventDefinition> events)
    {
        var methodName = methodNode.Identifier.Text;
        var methodFullName = $"{parentType.FullName}.{methodName}";
        var lineSpan = methodNode.SyntaxTree.GetLineSpan(methodNode.Span);

        var docComment = methodNode.GetLeadingTrivia()
            .Select(t => t.ToString().Trim())
            .FirstOrDefault(t => t.StartsWith("///"));

        var attributes = methodNode.AttributeLists
            .SelectMany(al => al.Attributes)
            .Select(a => a.Name.ToString())
            .ToList();

        var methodEntity = new CodeEntity
        {
            RepositoryId = repoId,
            Name = methodName,
            FullName = methodFullName,
            Namespace = currentNamespace,
            FilePath = relativePath,
            StartLine = lineSpan.StartLinePosition.Line + 1,
            EndLine = lineSpan.EndLinePosition.Line + 1,
            Type = EntityType.Method,
            Language = "C#",
            DocComment = docComment,
            Attributes = attributes
        };

        entities.Add(methodEntity);

        // Relationship: Class Contains Method
        relationships.Add(new CodeRelationship
        {
            RepositoryId = repoId,
            SourceEntityId = parentType.Id,
            SourceFullName = parentType.FullName,
            TargetEntityId = methodEntity.Id,
            TargetFullName = methodEntity.FullName,
            Type = RelationshipType.Contains,
            FilePath = relativePath,
            LineNumber = methodEntity.StartLine
        });

        // Method Invocations (CALLS) & DB Queries & Event Publishing
        if (methodNode.Body != null || methodNode.ExpressionBody != null)
        {
            var bodyText = methodNode.Body?.ToString() ?? methodNode.ExpressionBody?.ToString() ?? string.Empty;

            var invocations = methodNode.DescendantNodes().OfType<InvocationExpressionSyntax>();
            foreach (var invocation in invocations)
            {
                var callName = invocation.Expression.ToString();

                // Method Calls
                relationships.Add(new CodeRelationship
                {
                    RepositoryId = repoId,
                    SourceEntityId = methodEntity.Id,
                    SourceFullName = methodEntity.FullName,
                    TargetFullName = callName,
                    Type = RelationshipType.Calls,
                    FilePath = relativePath,
                    LineNumber = invocation.SyntaxTree.GetLineSpan(invocation.Span).StartLinePosition.Line + 1
                });

                // Detect Event Publishing via MassTransit / Bus
                if (callName.Contains(".Publish") || callName.Contains(".Send"))
                {
                    var typeArg = invocation.Expression.DescendantNodes().OfType<GenericNameSyntax>().FirstOrDefault()?.TypeArgumentList.Arguments.FirstOrDefault()?.ToString();
                    if (!string.IsNullOrEmpty(typeArg))
                    {
                        events.Add(new EventDefinition
                        {
                            RepositoryId = repoId,
                            EventName = typeArg,
                            MessageType = typeArg,
                            Role = "Publisher",
                            Broker = "MassTransit / RabbitMQ",
                            HandlerName = methodEntity.FullName,
                            FilePath = relativePath,
                            LineNumber = invocation.SyntaxTree.GetLineSpan(invocation.Span).StartLinePosition.Line + 1
                        });

                        relationships.Add(new CodeRelationship
                        {
                            RepositoryId = repoId,
                            SourceEntityId = methodEntity.Id,
                            SourceFullName = methodEntity.FullName,
                            TargetFullName = typeArg,
                            Type = RelationshipType.Publishes,
                            Context = "MassTransit / Message Broker",
                            FilePath = relativePath,
                            LineNumber = invocation.SyntaxTree.GetLineSpan(invocation.Span).StartLinePosition.Line + 1
                        });
                    }
                }
            }

            // Detect DB Access via EF Core or Dapper
            DetectDatabaseAccess(repoId, relativePath, methodEntity, bodyText, dbs);
        }
    }

    private void ProcessControllerApis(
        string repoId,
        string relativePath,
        TypeDeclarationSyntax typeNode,
        CodeEntity typeEntity,
        List<ApiDefinition> apis)
    {
        if (typeEntity.Type != EntityType.Controller && !typeEntity.Attributes.Any(a => a.Contains("ApiController") || a.Contains("Route")))
            return;

        string baseRoute = string.Empty;
        var routeAttr = typeNode.AttributeLists
            .SelectMany(al => al.Attributes)
            .FirstOrDefault(a => a.Name.ToString().StartsWith("Route"));

        if (routeAttr?.ArgumentList?.Arguments.FirstOrDefault() != null)
        {
            baseRoute = routeAttr.ArgumentList.Arguments.First().ToString().Trim('"');
            baseRoute = baseRoute.Replace("[controller]", typeEntity.Name.Replace("Controller", "", StringComparison.OrdinalIgnoreCase));
        }

        var methods = typeNode.Members.OfType<MethodDeclarationSyntax>();
        foreach (var method in methods)
        {
            var httpAttr = method.AttributeLists
                .SelectMany(al => al.Attributes)
                .FirstOrDefault(a => a.Name.ToString().StartsWith("Http"));

            if (httpAttr != null)
            {
                var httpMethod = httpAttr.Name.ToString().Replace("Http", "").ToUpperInvariant();
                var subRoute = httpAttr.ArgumentList?.Arguments.FirstOrDefault()?.ToString().Trim('"') ?? string.Empty;

                var fullRoute = string.IsNullOrEmpty(baseRoute) ? subRoute : $"{baseRoute}/{subRoute}".Replace("//", "/");
                if (!fullRoute.StartsWith("/")) fullRoute = "/" + fullRoute;
                if (fullRoute.Length > 1 && fullRoute.EndsWith("/")) fullRoute = fullRoute.TrimEnd('/');

                apis.Add(new ApiDefinition
                {
                    RepositoryId = repoId,
                    Route = fullRoute,
                    HttpMethod = httpMethod,
                    ControllerName = typeEntity.Name,
                    ActionName = method.Identifier.Text,
                    FilePath = relativePath,
                    LineNumber = method.SyntaxTree.GetLineSpan(method.Span).StartLinePosition.Line + 1
                });
            }
        }
    }

    private void ProcessSpecialRoles(
        string repoId,
        string relativePath,
        TypeDeclarationSyntax typeNode,
        CodeEntity typeEntity,
        List<DatabaseReference> dbs,
        List<EventDefinition> events)
    {
        // Detect EF Core DbContext DbSet properties
        if (typeNode.BaseList?.Types.Any(t => t.Type.ToString().Contains("DbContext")) == true)
        {
            var props = typeNode.Members.OfType<PropertyDeclarationSyntax>();
            foreach (var prop in props)
            {
                if (prop.Type.ToString().StartsWith("DbSet<"))
                {
                    var tableName = prop.Identifier.Text;
                    dbs.Add(new DatabaseReference
                    {
                        RepositoryId = repoId,
                        TableName = tableName,
                        Operation = "ORM Mapping",
                        OrmProvider = "EF Core DbSet",
                        SourceEntity = typeEntity.FullName,
                        FilePath = relativePath,
                        LineNumber = prop.SyntaxTree.GetLineSpan(prop.Span).StartLinePosition.Line + 1
                    });
                }
            }
        }

        // Detect MassTransit Consumer Interface `IConsumer<TEvent>`
        if (typeNode.BaseList != null)
        {
            foreach (var baseType in typeNode.BaseList.Types)
            {
                var typeStr = baseType.Type.ToString();
                var match = Regex.Match(typeStr, @"IConsumer<([^>]+)>");
                if (match.Success)
                {
                    var eventName = match.Groups[1].Value;
                    events.Add(new EventDefinition
                    {
                        RepositoryId = repoId,
                        EventName = eventName,
                        MessageType = eventName,
                        Role = "Consumer",
                        Broker = "MassTransit / RabbitMQ",
                        HandlerName = typeEntity.FullName,
                        FilePath = relativePath,
                        LineNumber = baseType.SyntaxTree.GetLineSpan(baseType.Span).StartLinePosition.Line + 1
                    });
                }
            }
        }
    }

    private void DetectDatabaseAccess(
        string repoId,
        string relativePath,
        CodeEntity methodEntity,
        string bodyText,
        List<DatabaseReference> dbs)
    {
        // Detect EF Core ORM queries
        if (bodyText.Contains("AddAsync") || bodyText.Contains("SaveChangesAsync") || bodyText.Contains("ToListAsync") || bodyText.Contains("FirstOrDefaultAsync"))
        {
            var match = Regex.Match(bodyText, @"_context\.([A-Za-z0-9_]+)|DbContext\.([A-Za-z0-9_]+)|db\.([A-Za-z0-9_]+)");
            var table = match.Success ? match.Groups[1].Value : "DatabaseTable";

            dbs.Add(new DatabaseReference
            {
                RepositoryId = repoId,
                TableName = string.IsNullOrEmpty(table) ? "DatabaseTable" : table,
                Operation = bodyText.Contains("AddAsync") || bodyText.Contains("Update") ? "WRITE" : "READ",
                OrmProvider = "EF Core",
                SourceEntity = methodEntity.FullName,
                FilePath = relativePath,
                LineNumber = methodEntity.StartLine
            });
        }

        // Detect Dapper Raw SQL Queries
        if (bodyText.Contains("QueryAsync") || bodyText.Contains("ExecuteAsync"))
        {
            dbs.Add(new DatabaseReference
            {
                RepositoryId = repoId,
                TableName = "DapperQuery",
                Operation = bodyText.Contains("ExecuteAsync") ? "WRITE" : "READ",
                OrmProvider = "Dapper Raw SQL",
                SourceEntity = methodEntity.FullName,
                FilePath = relativePath,
                LineNumber = methodEntity.StartLine
            });
        }
    }
}
