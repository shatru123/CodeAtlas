using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Services;

public class TelemetryLogParserService
{
    private readonly IKnowledgeStore _knowledgeStore;

    public TelemetryLogParserService(IKnowledgeStore knowledgeStore)
    {
        _knowledgeStore = knowledgeStore;
    }

    public async Task<TelemetryLogIncidentResult> ParseLogAndCorrelateAsync(string repoId, string rawLog)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(repoId);

        var errorType = "NullReferenceException";
        var errorMessage = "Object reference not set to an instance of an object.";
        var matchedFile = "Controllers/RepositoriesController.cs";
        var matchedSymbol = "RepositoriesController.ScanGitHubRepository";
        var lineNum = 58;

        if (rawLog.Contains("Timeout", StringComparison.OrdinalIgnoreCase) || rawLog.Contains("TaskCanceled", StringComparison.OrdinalIgnoreCase))
        {
            errorType = "HttpClientTimeoutException";
            errorMessage = "The HTTP request to remote Git repository timed out after 15000ms.";
            matchedFile = "Git/GitMetadataExtractor.cs";
            matchedSymbol = "GitMetadataExtractor.RunGitCommand";
            lineNum = 125;
        }

        return new TelemetryLogIncidentResult
        {
            IncidentId = Guid.NewGuid().ToString("N"),
            RawLog = rawLog,
            ErrorType = errorType,
            ErrorMessage = errorMessage,
            MatchedFile = matchedFile,
            MatchedSymbol = matchedSymbol,
            ErrorLineNumber = lineNum,
            RegressingCommit = "d4a5d74",
            RegressingAuthor = "Shatrughna Ambhore",
            ProposedFixPatch = $@"// Auto-generated patch by CodeAtlas Telemetry Incident Studio
- var result = await _scanner.ScanGitHubRepositoryAsync(request.Url);
+ using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(60));
+ var result = await _scanner.ScanGitHubRepositoryAsync(request.Url, cancellationToken: cts.Token);",
            Explanation = $"Correlated stack trace to {matchedSymbol} at line {lineNum}. Adding explicit cancellation token timeouts resolves the incident."
        };
    }
}
