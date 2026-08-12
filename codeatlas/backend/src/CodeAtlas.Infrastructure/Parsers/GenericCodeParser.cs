using System;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Infrastructure.Parsers;

public class GenericCodeParser : ILanguageParser
{
    public string LanguageName => "Generic Code Parser";

    private static readonly HashSet<string> SupportedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".java", ".go", ".sql", ".sh", ".bash", ".cpp", ".h", ".kt", ".rs"
    };

    public bool CanParse(string filePath)
    {
        var ext = Path.GetExtension(filePath);
        return !string.IsNullOrEmpty(ext) && SupportedExtensions.Contains(ext);
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
            var fileExt = Path.GetExtension(relativePath).ToLowerInvariant();
            string currentNamespace = Path.GetDirectoryName(relativePath)?.Replace(Path.DirectorySeparatorChar, '.') ?? "Global";

            for (int i = 0; i < lines.Length; i++)
            {
                var line = lines[i].Trim();
                var lineNumber = i + 1;

                // Java / Go Class / Struct / Interface extraction
                if (fileExt == ".java" || fileExt == ".go" || fileExt == ".kt")
                {
                    var classMatch = Regex.Match(line, @"(?:public\s+)?(?:class|interface|type)\s+([A-Za-z0-9_]+)");
                    if (classMatch.Success)
                    {
                        var name = classMatch.Groups[1].Value;
                        entities.Add(new CodeEntity
                        {
                            RepositoryId = repoId,
                            Name = name,
                            FullName = $"{currentNamespace}.{name}",
                            Namespace = currentNamespace,
                            FilePath = relativePath,
                            StartLine = lineNumber,
                            EndLine = lineNumber,
                            Type = line.Contains("interface") ? EntityType.Interface : EntityType.Class,
                            Language = fileExt.TrimStart('.').ToUpperInvariant()
                        });
                    }
                }

                // SQL Table & Query extraction
                if (fileExt == ".sql")
                {
                    var tableMatch = Regex.Match(line, @"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([A-Za-z0-9_""'\.]+)", RegexOptions.IgnoreCase);
                    if (tableMatch.Success)
                    {
                        var tableName = tableMatch.Groups[1].Value.Trim('"', '\'', '`');
                        dbs.Add(new DatabaseReference
                        {
                            RepositoryId = repoId,
                            TableName = tableName,
                            Operation = "CREATE TABLE",
                            OrmProvider = "SQL Schema",
                            SourceEntity = relativePath,
                            FilePath = relativePath,
                            LineNumber = lineNumber
                        });
                    }
                }
            }
        }
        catch (Exception ex)
        {
            errors.Add($"Failed to parse generic file {relativePath}: {ex.Message}");
        }

        return Task.CompletedTask;
    }
}
