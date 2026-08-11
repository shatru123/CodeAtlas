using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using RepoMind.Application.Abstractions;
using RepoMind.Domain.Models;

namespace RepoMind.Infrastructure.Parsers;

public class TypeScriptParser : ILanguageParser
{
    public string LanguageName => "TypeScript / JavaScript";

    public bool CanParse(string filePath)
    {
        var ext = Path.GetExtension(filePath).ToLowerInvariant();
        return ext == ".ts" || ext == ".tsx" || ext == ".js" || ext == ".jsx";
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

                // Extract Interfaces: `export interface InterfaceName`
                var ifaceMatch = Regex.Match(line, @"^(?:export\s+)?interface\s+([A-Za-z0-9_]+)");
                if (ifaceMatch.Success)
                {
                    var ifaceName = ifaceMatch.Groups[1].Value;
                    entities.Add(new CodeEntity
                    {
                        RepositoryId = repoId,
                        Name = ifaceName,
                        FullName = $"{currentNamespace}.{ifaceName}",
                        Namespace = currentNamespace,
                        FilePath = relativePath,
                        StartLine = lineNumber,
                        EndLine = lineNumber,
                        Type = EntityType.Interface,
                        Language = "TypeScript"
                    });
                }

                // Extract Classes: `export class ClassName extends BaseClass implements IInterface`
                var classMatch = Regex.Match(line, @"^(?:export\s+)?(?:default\s+)?class\s+([A-Za-z0-9_]+)");
                if (classMatch.Success)
                {
                    var className = classMatch.Groups[1].Value;
                    var entityType = EntityType.Class;
                    if (className.EndsWith("Controller", StringComparison.OrdinalIgnoreCase)) entityType = EntityType.Controller;
                    else if (className.EndsWith("Service", StringComparison.OrdinalIgnoreCase)) entityType = EntityType.Service;
                    else if (className.EndsWith("Repository", StringComparison.OrdinalIgnoreCase)) entityType = EntityType.Repository;
                    else if (className.EndsWith("Dto", StringComparison.OrdinalIgnoreCase)) entityType = EntityType.DTO;

                    entities.Add(new CodeEntity
                    {
                        RepositoryId = repoId,
                        Name = className,
                        FullName = $"{currentNamespace}.{className}",
                        Namespace = currentNamespace,
                        FilePath = relativePath,
                        StartLine = lineNumber,
                        EndLine = lineNumber,
                        Type = entityType,
                        Language = "TypeScript"
                    });
                }

                // Extract Functions: `function funcName(...)` or `const funcName = (...) =>`
                var funcMatch = Regex.Match(line, @"^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)|^(?:export\s+)?const\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\(");
                if (funcMatch.Success)
                {
                    var funcName = funcMatch.Groups[1].Success ? funcMatch.Groups[1].Value : funcMatch.Groups[2].Value;
                    if (!string.IsNullOrEmpty(funcName))
                    {
                        entities.Add(new CodeEntity
                        {
                            RepositoryId = repoId,
                            Name = funcName,
                            FullName = $"{currentNamespace}.{funcName}",
                            Namespace = currentNamespace,
                            FilePath = relativePath,
                            StartLine = lineNumber,
                            EndLine = lineNumber,
                            Type = EntityType.Method,
                            Language = "TypeScript"
                        });
                    }
                }

                // Extract Express / NestJS API Routes: `@Get('/route')`, `app.get('/route')`, `router.post('/route')`
                var apiMatch = Regex.Match(line, @"@?(Get|Post|Put|Delete|Patch)\s*\(\s*[""']([^""']+)[""']|app\.(get|post|put|delete|patch)\s*\(\s*[""']([^""']+)[""']|router\.(get|post|put|delete|patch)\s*\(\s*[""']([^""']+)[""']", RegexOptions.IgnoreCase);
                if (apiMatch.Success)
                {
                    var httpMethod = (apiMatch.Groups[1].Success ? apiMatch.Groups[1].Value : apiMatch.Groups[3].Success ? apiMatch.Groups[3].Value : apiMatch.Groups[5].Value).ToUpperInvariant();
                    var route = apiMatch.Groups[2].Success ? apiMatch.Groups[2].Value : apiMatch.Groups[4].Success ? apiMatch.Groups[4].Value : apiMatch.Groups[6].Value;

                    apis.Add(new ApiDefinition
                    {
                        RepositoryId = repoId,
                        Route = route,
                        HttpMethod = httpMethod,
                        ControllerName = Path.GetFileNameWithoutExtension(relativePath),
                        ActionName = "Handler",
                        FilePath = relativePath,
                        LineNumber = lineNumber
                    });
                }
            }
        }
        catch (Exception ex)
        {
            errors.Add($"Failed to parse TypeScript/JS file {relativePath}: {ex.Message}");
        }

        return Task.CompletedTask;
    }
}
