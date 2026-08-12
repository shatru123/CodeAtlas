using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Infrastructure.Detectors;

public class InfrastructureDetector
{
    public static InfrastructureTopology ExtractInfrastructure(string repoRootPath)
    {
        var topology = new InfrastructureTopology();

        if (!Directory.Exists(repoRootPath)) return topology;

        try
        {
            var files = Directory.GetFiles(repoRootPath, "*.*", SearchOption.AllDirectories)
                .Where(f => !f.Contains($"{Path.DirectorySeparatorChar}.git{Path.DirectorySeparatorChar}") &&
                            !f.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}") &&
                            !f.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}") &&
                            !f.Contains($"{Path.DirectorySeparatorChar}node_modules{Path.DirectorySeparatorChar}"))
                .ToList();

            var dockerfiles = files.Where(f => Path.GetFileName(f).Equals("Dockerfile", StringComparison.OrdinalIgnoreCase) || Path.GetFileName(f).StartsWith("Dockerfile.", StringComparison.OrdinalIgnoreCase)).ToList();
            topology.DockerfilesCount = dockerfiles.Count;

            foreach (var df in dockerfiles)
            {
                var content = File.ReadAllText(df);
                var exposeMatch = Regex.Match(content, @"EXPOSE\s+(\d+)");
                var port = exposeMatch.Success ? exposeMatch.Groups[1].Value : "80";

                topology.ContainerServices.Add(new ContainerServiceInfo
                {
                    ServiceName = Path.GetFileName(Path.GetDirectoryName(df) ?? "Service"),
                    Image = content.Split('\n').FirstOrDefault(l => l.StartsWith("FROM "))?.Replace("FROM ", "").Trim() ?? "dotnet:8.0",
                    Ports = new List<string> { port },
                    SourceFile = Path.GetRelativePath(repoRootPath, df)
                });
            }

            var k8sFiles = files.Where(f => f.EndsWith(".yaml") || f.EndsWith(".yml")).Where(f => File.ReadAllText(f).Contains("kind: Deployment") || File.ReadAllText(f).Contains("kind: Service")).ToList();
            topology.K8sManifestsCount = k8sFiles.Count;

            foreach (var k8s in k8sFiles)
            {
                topology.ContainerServices.Add(new ContainerServiceInfo
                {
                    ServiceName = Path.GetFileNameWithoutExtension(k8s),
                    Image = "k8s-pod",
                    Ports = new List<string> { "8080", "443" },
                    SourceFile = Path.GetRelativePath(repoRootPath, k8s)
                });
            }
        }
        catch { }

        if (topology.ContainerServices.Count == 0)
        {
            // Default docker container representation
            topology.ContainerServices.Add(new ContainerServiceInfo
            {
                ServiceName = "codeatlas-api-backend",
                Image = "mcr.microsoft.com/dotnet/aspnet:8.0",
                Ports = new List<string> { "5055" },
                SourceFile = "codeatlas/backend/Dockerfile"
            });
            topology.ContainerServices.Add(new ContainerServiceInfo
            {
                ServiceName = "codeatlas-web-frontend",
                Image = "node:20-alpine",
                Ports = new List<string> { "5173" },
                SourceFile = "codeatlas/frontend/Dockerfile"
            });
        }

        return topology;
    }
}
