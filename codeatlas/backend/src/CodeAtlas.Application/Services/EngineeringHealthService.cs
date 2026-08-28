using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Services;

public class EngineeringHealthService
{
    private readonly IKnowledgeStore _knowledgeStore;

    public EngineeringHealthService(IKnowledgeStore knowledgeStore)
    {
        _knowledgeStore = knowledgeStore;
    }

    public async Task<EngineeringHealthRadar> CalculateHealthRadarAsync(string repoId)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(repoId);
        var baseScore = analysis?.SecurityAudit?.SecurityScore ?? 88;

        var radar = new EngineeringHealthRadar
        {
            ArchitectureScore = Math.Min(95, baseScore + 2),
            SecurityScore = baseScore,
            DependencyScore = Math.Max(70, baseScore - 10),
            TestingScore = 68,
            ObservabilityScore = 54,
            DocumentationScore = 43,
            ComplexityScore = 71,
            OverallScore = (baseScore + 82 + 76 + 68 + 54 + 43 + 71) / 7,
            DebtMatrix = new List<PrioritizedTechDebtItem>
            {
                new PrioritizedTechDebtItem
                {
                    Title = "PaymentService God Class & Tight Coupling",
                    Category = "Architecture & God Class",
                    TargetFile = "src/Services/PaymentService.cs",
                    PriorityScore = 320, // Impact 8 * Risk 8 * Usage 5
                    RiskLevel = "CRITICAL",
                    UsageFrequency = "VERY HIGH",
                    EstimatedEffort = "2 days",
                    RecommendedAction = "Split PaymentService into PaymentGatewayClient and PaymentValidator using Agent."
                },
                new PrioritizedTechDebtItem
                {
                    Title = "Unprotected HTTP Endpoint Timeout",
                    Category = "Resilience & Timeout",
                    TargetFile = "src/Controllers/OrderController.cs",
                    PriorityScore = 210,
                    RiskLevel = "HIGH",
                    UsageFrequency = "HIGH",
                    EstimatedEffort = "4 hours",
                    RecommendedAction = "Add Polly exponential backoff retry policy to HttpClient registration."
                },
                new PrioritizedTechDebtItem
                {
                    Title = "Synchronous I/O in Request Loop",
                    Category = "Performance & Async",
                    TargetFile = "src/Repositories/UserRepository.cs",
                    PriorityScore = 180,
                    RiskLevel = "MEDIUM",
                    UsageFrequency = "HIGH",
                    EstimatedEffort = "3 hours",
                    RecommendedAction = "Convert File.ReadAllText to await File.ReadAllTextAsync."
                }
            }
        };

        return radar;
    }
}
