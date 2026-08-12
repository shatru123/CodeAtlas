using System;
using System.Collections.Generic;
using System.Linq;
using RepoMind.Domain.Models;

namespace RepoMind.Application.Services;

public class ImpactEngine
{
    public static BlastRadiusResult CalculateBlastRadius(string targetEntityName, AnalysisResult analysis, WorkspaceMeshSummary mesh)
    {
        var result = new BlastRadiusResult
        {
            TargetEntityName = targetEntityName
        };

        if (string.IsNullOrWhiteSpace(targetEntityName))
        {
            targetEntityName = analysis.Entities.FirstOrDefault()?.Name ?? "Component";
            result.TargetEntityName = targetEntityName;
        }

        // 1. Direct and Indirect Dependency Traversal
        var affectedControllers = new List<AffectedComponentInfo>();
        var affectedServices = new List<AffectedComponentInfo>();
        var affectedRepos = new List<AffectedComponentInfo>();
        var affectedDbs = new List<AffectedComponentInfo>();
        var affectedMeshServices = new List<AffectedComponentInfo>();

        var matchingEntities = analysis.Entities.Where(e => e.Name.Contains(targetEntityName, StringComparison.OrdinalIgnoreCase) || e.FullName.Contains(targetEntityName, StringComparison.OrdinalIgnoreCase)).ToList();

        foreach (var entity in matchingEntities)
        {
            // Find callers (incoming calls)
            var callers = analysis.Relationships.Where(r => r.TargetEntityId == entity.Id || r.TargetFullName.Contains(entity.Name)).ToList();
            foreach (var caller in callers)
            {
                var callerEntity = analysis.Entities.FirstOrDefault(e => e.Id == caller.SourceEntityId || e.FullName == caller.SourceFullName);
                var compInfo = new AffectedComponentInfo
                {
                    Name = caller.SourceFullName,
                    Type = callerEntity?.Type.ToString() ?? "Service",
                    FilePath = caller.FilePath ?? callerEntity?.FilePath ?? "",
                    Context = caller.Context ?? $"Calls {entity.Name}"
                };

                if (callerEntity?.Type == EntityType.Controller || caller.SourceFullName.EndsWith("Controller"))
                {
                    affectedControllers.Add(compInfo);
                }
                else if (callerEntity?.Type == EntityType.Service || caller.SourceFullName.EndsWith("Service"))
                {
                    affectedServices.Add(compInfo);
                }
                else
                {
                    affectedRepos.Add(compInfo);
                }
            }

            // Find DB operations
            var dbOps = analysis.Databases.Where(d => d.FilePath == entity.FilePath || d.SourceEntity.Contains(entity.Name)).ToList();
            foreach (var db in dbOps)
            {
                affectedDbs.Add(new AffectedComponentInfo
                {
                    Name = db.TableName,
                    Type = db.OrmProvider,
                    FilePath = db.FilePath,
                    Context = $"Operation: {db.Operation}"
                });
            }
        }

        // Check Multi-Repo Workspace Mesh Impact
        if (mesh != null)
        {
            var meshImpacts = mesh.Dependencies.Where(d => d.SourceRepoId == analysis.Repository.Id && (d.SourceComponent.Contains(targetEntityName) || d.TargetComponent.Contains(targetEntityName))).ToList();
            foreach (var m in meshImpacts)
            {
                affectedMeshServices.Add(new AffectedComponentInfo
                {
                    Name = m.TargetRepoName,
                    Type = m.DependencyType,
                    FilePath = m.TargetComponent,
                    Context = m.Context
                });
            }
        }

        result.AffectedControllers = affectedControllers.DistinctBy(c => c.Name).ToList();
        result.AffectedServices = affectedServices.DistinctBy(s => s.Name).ToList();
        result.AffectedRepositories = affectedRepos.DistinctBy(r => r.Name).ToList();
        result.AffectedDatabases = affectedDbs.DistinctBy(d => d.Name).ToList();
        result.AffectedCrossRepoServices = affectedMeshServices.DistinctBy(m => m.Name).ToList();

        // Calculate Impact Score
        int totalImpacted = result.AffectedControllers.Count * 15 + result.AffectedServices.Count * 10 + result.AffectedRepositories.Count * 8 + result.AffectedDatabases.Count * 12 + result.AffectedCrossRepoServices.Count * 25;
        result.ImpactScore = Math.Min(100, Math.Max(15, totalImpacted));

        result.RiskLevel = result.ImpactScore >= 75 ? "Critical" : result.ImpactScore >= 50 ? "High" : result.ImpactScore >= 25 ? "Medium" : "Low";

        return result;
    }
}
