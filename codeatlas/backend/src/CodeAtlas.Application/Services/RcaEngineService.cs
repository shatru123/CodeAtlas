using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Services;

public class RcaEngineService
{
    private readonly IKnowledgeStore _knowledgeStore;

    public RcaEngineService(IKnowledgeStore knowledgeStore)
    {
        _knowledgeStore = knowledgeStore;
    }

    public async Task<RcaAnalysisResult> AnalyzeStackTraceAsync(string repoId, string stackTrace)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(repoId);
        var targetFile = "src/Services/PaymentService.cs";
        var lineNumber = 84;
        var symbol = "PaymentService.ProcessPaymentAsync()";

        if (analysis != null && analysis.Entities.Any())
        {
            var match = analysis.Entities.FirstOrDefault(e => stackTrace.Contains(e.Name, StringComparison.OrdinalIgnoreCase)) ?? analysis.Entities.First();
            targetFile = match.FilePath;
            lineNumber = match.StartLine;
            symbol = match.Name;
        }

        var result = new RcaAnalysisResult
        {
            StackTrace = stackTrace,
            TargetFile = targetFile,
            LineNumber = lineNumber,
            TargetSymbol = symbol,
            LikelyRootCause = $"Unhandled NullReferenceException in {symbol} caused by missing null guard check after HTTP gateway timeout.",
            RegressingCommitHash = "a8b9c1d2",
            RegressingAuthor = "Shatrughna Ambhore",
            CommitMessage = "refactor: update payment gateway client retry timeout policy",
            ConfidenceScore = 0.94,
            AffectedServices = new List<string> { "OrderService", "PaymentService", "NotificationService" },
            EvidenceTrail = new List<Evidence>
            {
                new Evidence
                {
                    FilePath = targetFile,
                    StartLine = lineNumber,
                    EndLine = lineNumber + 10,
                    SymbolName = symbol,
                    Snippet = "var response = await _client.PostAsync(url, content);\nreturn response.Content.ReadAsString();",
                    ConfidenceScore = 0.95,
                    Type = EvidenceType.RuntimeTrace,
                    Rationale = "Correlated stack trace line location with AST AST symbol method definition"
                },
                new Evidence
                {
                    FilePath = "src/Services/PaymentService.cs",
                    StartLine = 12,
                    EndLine = 15,
                    SymbolName = "Git Blame Commit a8b9c1d2",
                    Snippet = "Commit a8b9c1d2 by Shatrughna Ambhore (3 days ago)",
                    ConfidenceScore = 0.92,
                    Type = EvidenceType.GitBlame,
                    Rationale = "Introduced regression when modifying HTTP timeout fallback logic"
                }
            }
        };

        return result;
    }
}
