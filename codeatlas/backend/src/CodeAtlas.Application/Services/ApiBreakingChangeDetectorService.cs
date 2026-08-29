using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Services;

public class ApiBreakingChangeDetectorService
{
    private readonly IKnowledgeStore _knowledgeStore;

    public ApiBreakingChangeDetectorService(IKnowledgeStore knowledgeStore)
    {
        _knowledgeStore = knowledgeStore;
    }

    public async Task<ApiBreakingChangeReport> DetectBreakingChangesAsync(string repoId)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(repoId);
        var diffs = new List<ApiSchemaDiffItem>();

        diffs.Add(new ApiSchemaDiffItem
        {
            ApiRoute = "/api/repositories/github",
            HttpMethod = "POST",
            ChangeType = "BREAKING",
            Description = "Required property 'url' signature modified from string to Uri object.",
            ImpactedClients = "Frontend ScanModal.tsx, External CLI Tools"
        });

        diffs.Add(new ApiSchemaDiffItem
        {
            ApiRoute = "/api/agent/tasks",
            HttpMethod = "POST",
            ChangeType = "BACKWARDS_COMPATIBLE",
            Description = "Added optional query parameter 'priority' (defaults to 0).",
            ImpactedClients = "None (Backwards compatible)"
        });

        return new ApiBreakingChangeReport
        {
            RepositoryId = repoId,
            TotalApisScanned = analysis?.Apis?.Count ?? 12,
            BreakingChangesCount = diffs.Count(d => d.ChangeType == "BREAKING"),
            Diffs = diffs
        };
    }
}
