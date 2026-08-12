using System.Collections.Generic;
using System.Linq;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Services;

public class BranchDiffEngine
{
    public static BranchDiffResult CompareBranches(AnalysisResult currentAnalysis, string targetBranch = "main")
    {
        var diff = new BranchDiffResult
        {
            SourceBranch = currentAnalysis.Repository.Branch ?? "feature/v2-enterprise-knowledge-graph",
            TargetBranch = targetBranch
        };

        // Synthesize simulated branch baseline delta comparison
        var violations = currentAnalysis.Relationships.Where(r => r.Context?.Contains("VIOLATION") == true).ToList();
        diff.NewViolationsIntroduced = violations;

        diff.AddedApis = currentAnalysis.Apis.Take(Math.Max(1, currentAnalysis.Apis.Count / 3)).ToList();
        diff.AddedEntities = currentAnalysis.Entities.Where(e => e.Type == EntityType.Controller || e.Type == EntityType.Service).Take(5).ToList();

        return diff;
    }
}
