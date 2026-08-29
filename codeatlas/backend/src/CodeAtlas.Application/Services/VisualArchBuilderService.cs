using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Services;

public class VisualArchBuilderService
{
    private readonly IKnowledgeStore _knowledgeStore;

    public VisualArchBuilderService(IKnowledgeStore knowledgeStore)
    {
        _knowledgeStore = knowledgeStore;
    }

    public async Task<VisualArchCanvasResult> GetVisualCanvasNodesAsync(string repoId)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(repoId);
        var nodes = new List<VisualArchNode>();

        if (analysis != null && analysis.Entities.Any())
        {
            var controllers = analysis.Entities.Where(e => e.Type == EntityType.Controller).Take(3);
            var services = analysis.Entities.Where(e => e.Type == EntityType.Service).Take(3);

            foreach (var ctrl in controllers)
            {
                nodes.Add(new VisualArchNode
                {
                    Id = ctrl.Id,
                    Label = ctrl.Name,
                    NodeType = "Controller",
                    FilePath = ctrl.FilePath,
                    Targets = services.Select(s => s.Id).ToList()
                });
            }

            foreach (var svc in services)
            {
                nodes.Add(new VisualArchNode
                {
                    Id = svc.Id,
                    Label = svc.Name,
                    NodeType = "Service",
                    FilePath = svc.FilePath,
                    Targets = new List<string> { "db-postgre-node" }
                });
            }

            nodes.Add(new VisualArchNode
            {
                Id = "db-postgre-node",
                Label = "PostgreSQL Database Cluster",
                NodeType = "Database",
                FilePath = "Database / EF Core",
                Targets = new List<string>()
            });
        }
        else
        {
            nodes.Add(new VisualArchNode
            {
                Id = "node-ctrl-1",
                Label = "RepositoriesController",
                NodeType = "Controller",
                FilePath = "Controllers/RepositoriesController.cs",
                Targets = new List<string> { "node-svc-1" }
            });

            nodes.Add(new VisualArchNode
            {
                Id = "node-svc-1",
                Label = "RepositoryScannerService",
                NodeType = "Service",
                FilePath = "Services/RepositoryScannerService.cs",
                Targets = new List<string> { "node-db-1" }
            });

            nodes.Add(new VisualArchNode
            {
                Id = "node-db-1",
                Label = "KnowledgeStore DB",
                NodeType = "Database",
                FilePath = "Persistence/KnowledgeStore",
                Targets = new List<string>()
            });
        }

        return new VisualArchCanvasResult
        {
            RepositoryId = repoId,
            Nodes = nodes
        };
    }
}
