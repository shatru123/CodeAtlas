using System;
using System.Collections.Generic;
using System.Linq;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Services;

public class MeshEngine
{
    public static WorkspaceMeshSummary BuildWorkspaceMesh(List<AnalysisResult> allAnalyses)
    {
        var summary = new WorkspaceMeshSummary
        {
            TotalRepositories = allAnalyses.Count,
            Repositories = allAnalyses.Select(a => a.Repository).ToList()
        };

        var crossDeps = new List<CrossRepoDependency>();

        // Match cross-repo REST HTTP API dependencies
        for (int i = 0; i < allAnalyses.Count; i++)
        {
            for (int j = 0; j < allAnalyses.Count; j++)
            {
                if (i == j) continue;

                var sourceAnalysis = allAnalyses[i];
                var targetAnalysis = allAnalyses[j];

                // Match REST Client calls in Source to exposed APIs in Target
                foreach (var targetApi in targetAnalysis.Apis)
                {
                    var matchingSourceRels = sourceAnalysis.Relationships
                        .Where(r => r.TargetFullName.Contains(targetApi.Route, StringComparison.OrdinalIgnoreCase) ||
                                    r.TargetFullName.Contains(targetApi.ControllerName, StringComparison.OrdinalIgnoreCase))
                        .ToList();

                    foreach (var rel in matchingSourceRels)
                    {
                        crossDeps.Add(new CrossRepoDependency
                        {
                            SourceRepoId = sourceAnalysis.Repository.Id,
                            SourceRepoName = sourceAnalysis.Repository.Name,
                            SourceComponent = rel.SourceFullName,
                            TargetRepoId = targetAnalysis.Repository.Id,
                            TargetRepoName = targetAnalysis.Repository.Name,
                            TargetComponent = $"{targetApi.ControllerName}.{targetApi.ActionName} ({targetApi.HttpMethod} {targetApi.Route})",
                            DependencyType = "REST_HTTP",
                            Protocol = "HTTP/JSON",
                            Context = $"Cross-Repository REST HTTP Call to {targetApi.Route}"
                        });
                    }
                }

                // Match Published Events in Source to Consumed Events in Target
                foreach (var sourceEvent in sourceAnalysis.Events.Where(e => e.Role == "Publisher"))
                {
                    var matchingConsumer = targetAnalysis.Events.FirstOrDefault(e =>
                        e.Role == "Consumer" &&
                        e.EventName.Equals(sourceEvent.EventName, StringComparison.OrdinalIgnoreCase));

                    if (matchingConsumer != null)
                    {
                        crossDeps.Add(new CrossRepoDependency
                        {
                            SourceRepoId = sourceAnalysis.Repository.Id,
                            SourceRepoName = sourceAnalysis.Repository.Name,
                            SourceComponent = sourceEvent.EventName,
                            TargetRepoId = targetAnalysis.Repository.Id,
                            TargetRepoName = targetAnalysis.Repository.Name,
                            TargetComponent = matchingConsumer.HandlerName,
                            DependencyType = "EVENT_MESSAGE",
                            Protocol = sourceEvent.Broker,
                            Context = $"Async Event Stream ({sourceEvent.Broker}): {sourceEvent.EventName}"
                        });
                    }
                }
            }
        }

        summary.Dependencies = crossDeps.DistinctBy(d => $"{d.SourceRepoId}_{d.TargetRepoId}_{d.SourceComponent}_{d.TargetComponent}").ToList();
        summary.TotalCrossRepoDependencies = summary.Dependencies.Count;

        return summary;
    }
}
