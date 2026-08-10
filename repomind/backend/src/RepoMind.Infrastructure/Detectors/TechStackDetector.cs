using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using RepoMind.Application.Abstractions;

namespace RepoMind.Infrastructure.Detectors;

public class TechStackDetector : ITechStackDetector
{
    public Task<List<string>> DetectTechStackAsync(string repoRootPath)
    {
        var techStack = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        if (!Directory.Exists(repoRootPath)) return Task.FromResult(techStack.ToList());

        var files = Directory.GetFiles(repoRootPath, "*.*", SearchOption.AllDirectories)
            .Where(f => !f.Contains($"{Path.DirectorySeparatorChar}.git{Path.DirectorySeparatorChar}") &&
                        !f.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}") &&
                        !f.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}") &&
                        !f.Contains($"{Path.DirectorySeparatorChar}node_modules{Path.DirectorySeparatorChar}"))
            .ToList();

        foreach (var file in files)
        {
            var fileName = Path.GetFileName(file);
            var ext = Path.GetExtension(file)?.ToLowerInvariant() ?? string.Empty;

            // .NET C# (.csproj / .sln / .cs)
            if (ext == ".csproj" || ext == ".sln" || ext == ".cs")
            {
                techStack.Add(".NET");
                techStack.Add("C#");
            }

            if (ext == ".csproj")
            {
                try
                {
                    var content = File.ReadAllText(file);
                    if (content.Contains("Microsoft.AspNetCore")) techStack.Add("ASP.NET Core");
                    if (content.Contains("EntityFrameworkCore")) techStack.Add("Entity Framework Core");
                    if (content.Contains("Dapper")) techStack.Add("Dapper");
                    if (content.Contains("MassTransit")) techStack.Add("MassTransit");
                    if (content.Contains("RabbitMQ")) techStack.Add("RabbitMQ");
                    if (content.Contains("Confluent.Kafka") || content.Contains("Kafka")) techStack.Add("Kafka");
                    if (content.Contains("MediatR")) techStack.Add("MediatR");
                    if (content.Contains("NServiceBus")) techStack.Add("NServiceBus");
                    if (content.Contains("StackExchange.Redis")) techStack.Add("Redis");
                    if (content.Contains("Npgsql") || content.Contains("PostgreSQL")) techStack.Add("PostgreSQL");
                    if (content.Contains("SqlServer") || content.Contains("SqlClient")) techStack.Add("SQL Server");
                }
                catch { }
            }

            // JavaScript / TypeScript (package.json)
            if (fileName.Equals("package.json", StringComparison.OrdinalIgnoreCase))
            {
                techStack.Add("Node.js");
                try
                {
                    var content = File.ReadAllText(file);
                    if (content.Contains("\"react\"")) techStack.Add("React");
                    if (content.Contains("\"@angular/core\"")) techStack.Add("Angular");
                    if (content.Contains("\"vue\"")) techStack.Add("Vue.js");
                    if (content.Contains("\"next\"")) techStack.Add("Next.js");
                    if (content.Contains("\"express\"")) techStack.Add("Express");
                    if (content.Contains("\"typescript\"")) techStack.Add("TypeScript");
                }
                catch { }
            }

            // Python (requirements.txt / pyproject.toml / .py)
            if (ext == ".py" || fileName.Equals("requirements.txt", StringComparison.OrdinalIgnoreCase) || fileName.Equals("pyproject.toml", StringComparison.OrdinalIgnoreCase))
            {
                techStack.Add("Python");
                if (fileName.Equals("requirements.txt", StringComparison.OrdinalIgnoreCase) || fileName.Equals("pyproject.toml", StringComparison.OrdinalIgnoreCase))
                {
                    try
                    {
                        var content = File.ReadAllText(file);
                        if (content.Contains("fastapi")) techStack.Add("FastAPI");
                        if (content.Contains("django")) techStack.Add("Django");
                        if (content.Contains("flask")) techStack.Add("Flask");
                        if (content.Contains("sqlalchemy")) techStack.Add("SQLAlchemy");
                        if (content.Contains("celery")) techStack.Add("Celery");
                    }
                    catch { }
                }
            }

            // Docker / Infra
            if (fileName.Equals("Dockerfile", StringComparison.OrdinalIgnoreCase)) techStack.Add("Docker");
            if (fileName.Equals("docker-compose.yml", StringComparison.OrdinalIgnoreCase) || fileName.Equals("docker-compose.yaml", StringComparison.OrdinalIgnoreCase)) techStack.Add("Docker Compose");
            if (ext == ".tf") techStack.Add("Terraform");
            if (file.Contains(".github") && file.Contains("workflows")) techStack.Add("GitHub Actions");
            if (fileName.Equals(".gitlab-ci.yml", StringComparison.OrdinalIgnoreCase)) techStack.Add("GitLab CI");
        }

        return Task.FromResult(techStack.ToList());
    }

    public Task<List<string>> DetectLanguagesAsync(string repoRootPath)
    {
        var languages = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        if (!Directory.Exists(repoRootPath)) return Task.FromResult(languages.ToList());

        var extensions = Directory.GetFiles(repoRootPath, "*.*", SearchOption.AllDirectories)
            .Where(f => !f.Contains($"{Path.DirectorySeparatorChar}.git{Path.DirectorySeparatorChar}") &&
                        !f.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}") &&
                        !f.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}") &&
                        !f.Contains($"{Path.DirectorySeparatorChar}node_modules{Path.DirectorySeparatorChar}"))
            .Select(Path.GetExtension)
            .Where(e => !string.IsNullOrEmpty(e))
            .Select(e => e!.ToLowerInvariant());

        foreach (var ext in extensions)
        {
            switch (ext)
            {
                case ".cs": case ".csproj": languages.Add("C#"); break;
                case ".py": languages.Add("Python"); break;
                case ".ts": case ".tsx": languages.Add("TypeScript"); break;
                case ".js": case ".jsx": languages.Add("JavaScript"); break;
                case ".java": languages.Add("Java"); break;
                case ".go": languages.Add("Go"); break;
                case ".sql": languages.Add("SQL"); break;
                case ".json": case ".yaml": case ".yml": languages.Add("Configuration"); break;
            }
        }

        return Task.FromResult(languages.ToList());
    }
}
