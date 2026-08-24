using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Infrastructure.Parsers;

public class PythonParser : ILanguageParser
{
    public string LanguageName => "Python";

    public bool CanParse(string filePath)
    {
        return filePath.EndsWith(".py", StringComparison.OrdinalIgnoreCase);
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
            var lines = sourceCode.Split('\n');
            string currentNamespace = Path.GetDirectoryName(relativePath)?.Replace(Path.DirectorySeparatorChar, '.') ?? "Global";

            for (int i = 0; i < lines.Length; i++)
            {
                var line = lines[i].Trim();
                var lineNumber = i + 1;

                // Extract Classes: `class ClassName(BaseClass):`
                var classMatch = Regex.Match(line, @"^class\s+([A-Za-z0-9_]+)(?:\(([^)]+)\))?:");
                if (classMatch.Success)
                {
                    var className = classMatch.Groups[1].Value;
                    var baseClasses = classMatch.Groups[2].Value;
                    var fullName = string.IsNullOrEmpty(currentNamespace) ? className : $"{currentNamespace}.{className}";

                    var entityType = EntityType.Class;
                    if (className.EndsWith("Service", StringComparison.OrdinalIgnoreCase)) entityType = EntityType.Service;
                    else if (className.EndsWith("Controller", StringComparison.OrdinalIgnoreCase) || className.EndsWith("Router", StringComparison.OrdinalIgnoreCase)) entityType = EntityType.Controller;
                    else if (className.EndsWith("Repository", StringComparison.OrdinalIgnoreCase)) entityType = EntityType.Repository;
                    else if (className.EndsWith("Schema", StringComparison.OrdinalIgnoreCase) || className.EndsWith("Model", StringComparison.OrdinalIgnoreCase)) entityType = EntityType.DTO;

                    var classEntity = new CodeEntity
                    {
                        RepositoryId = repoId,
                        Name = className,
                        FullName = fullName,
                        Namespace = currentNamespace,
                        FilePath = relativePath,
                        StartLine = lineNumber,
                        EndLine = lineNumber,
                        Type = entityType,
                        Language = "Python"
                    };
                    entities.Add(classEntity);

                    if (!string.IsNullOrWhiteSpace(baseClasses))
                    {
                        foreach (var baseClass in baseClasses.Split(','))
                        {
                            relationships.Add(new CodeRelationship
                            {
                                RepositoryId = repoId,
                                SourceEntityId = classEntity.Id,
                                SourceFullName = classEntity.FullName,
                                TargetFullName = baseClass.Trim(),
                                Type = RelationshipType.Inherits,
                                FilePath = relativePath,
                                LineNumber = lineNumber
                            });
                        }
                    }
                }

                // Extract Functions: `def function_name(...)`
                var funcMatch = Regex.Match(line, @"^(?:async\s+)?def\s+([A-Za-z0-9_]+)\s*\(");
                if (funcMatch.Success)
                {
                    var funcName = funcMatch.Groups[1].Value;
                    var funcEntity = new CodeEntity
                    {
                        RepositoryId = repoId,
                        Name = funcName,
                        FullName = $"{currentNamespace}.{funcName}",
                        Namespace = currentNamespace,
                        FilePath = relativePath,
                        StartLine = lineNumber,
                        EndLine = lineNumber,
                        Type = EntityType.Method,
                        Language = "Python"
                    };
                    entities.Add(funcEntity);
                }

                // Extract FastAPI / Flask Routes: `@app.get("/route")` or `@router.post("/route")`
                var apiMatch = Regex.Match(line, @"@(?:app|router|api)\.(get|post|put|delete|patch)\s*\(\s*[""']([^""']+)[""']");
                if (apiMatch.Success)
                {
                    var httpMethod = apiMatch.Groups[1].Value.ToUpperInvariant();
                    var route = apiMatch.Groups[2].Value;

                    apis.Add(new ApiDefinition
                    {
                        RepositoryId = repoId,
                        Route = route,
                        HttpMethod = httpMethod,
                        ControllerName = Path.GetFileNameWithoutExtension(relativePath),
                        ActionName = (i + 1 < lines.Length) ? lines[i + 1].Trim() : "Action",
                        FilePath = relativePath,
                        LineNumber = lineNumber
                    });
                }

                // Extract SQLAlchemy / Raw SQL DB queries
                if (line.Contains("db.query") || line.Contains("session.execute") || line.Contains("SELECT ") || line.Contains("INSERT "))
                {
                    dbs.Add(new DatabaseReference
                    {
                        RepositoryId = repoId,
                        TableName = "PythonDatabaseQuery",
                        Operation = line.Contains("INSERT") || line.Contains("UPDATE") ? "WRITE" : "READ",
                        OrmProvider = "SQLAlchemy / Raw SQL",
                        SourceEntity = relativePath,
                        FilePath = relativePath,
                        LineNumber = lineNumber
                    });
                }
            }
        }
        catch (Exception ex)
        {
            errors.Add($"Failed to parse Python file {relativePath}: {ex.Message}");
        }

        return Task.CompletedTask;
    }
}
