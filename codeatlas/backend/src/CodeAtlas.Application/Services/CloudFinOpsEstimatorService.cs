using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Services;

public class CloudFinOpsEstimatorService
{
    private readonly IKnowledgeStore _knowledgeStore;

    public CloudFinOpsEstimatorService(IKnowledgeStore knowledgeStore)
    {
        _knowledgeStore = knowledgeStore;
    }

    public async Task<CloudFinOpsReport> EstimateCloudCostsAsync(string repoId)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(repoId);
        var resources = new List<CloudResourceCostItem>();

        resources.Add(new CloudResourceCostItem
        {
            ResourceName = "PostgreSQL Database Cluster",
            ResourceType = "Database",
            MonthlyCostUsd = 65.00,
            SizingSpec = "2 vCPU / 4GB RAM (db.t4g.small)",
            OptimizationTip = "Enable connection pooling (PgBouncer) to reduce active DB worker connections."
        });

        resources.Add(new CloudResourceCostItem
        {
            ResourceName = "ASP.NET Core App Container",
            ResourceType = "Container",
            MonthlyCostUsd = 45.00,
            SizingSpec = "1 vCPU / 2GB RAM (AWS Fargate)",
            OptimizationTip = "Configure auto-scaling down to 1 instance during off-peak hours (12 AM - 6 AM)."
        });

        resources.Add(new CloudResourceCostItem
        {
            ResourceName = "Redis In-Memory Cache",
            ResourceType = "Caching",
            MonthlyCostUsd = 25.00,
            SizingSpec = "1.5GB RAM (cache.t4g.micro)",
            OptimizationTip = "Set 1-hour TTL on static AST symbol lookups to prevent cache bloat."
        });

        return new CloudFinOpsReport
        {
            RepositoryId = repoId,
            TotalEstimatedMonthlyCostUsd = resources.Sum(r => r.MonthlyCostUsd),
            PrimaryCloudProvider = "AWS / Docker Cloud",
            Resources = resources
        };
    }
}
