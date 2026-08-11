using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using RepoMind.Application.Abstractions;
using RepoMind.Application.Services;
using RepoMind.Domain.Models;
using RepoMind.Infrastructure.Detectors;
using RepoMind.Infrastructure.Git;
using RepoMind.Infrastructure.Parsers;
using RepoMind.Infrastructure.Persistence;
using Xunit;

namespace RepoMind.Domain.Tests;

public class RepositoryScannerServiceTests
{
    private readonly RepositoryScannerService _scanner;
    private readonly InMemoryKnowledgeStore _knowledgeStore;

    public RepositoryScannerServiceTests()
    {
        var parsers = new List<ILanguageParser>
        {
            new CSharpRoslynParser(),
            new PythonParser(),
            new TypeScriptParser(),
            new GenericCodeParser()
        };
        var techStackDetector = new TechStackDetector();
        var gitExtractor = new GitMetadataExtractor();
        _knowledgeStore = new InMemoryKnowledgeStore();

        _scanner = new RepositoryScannerService(parsers, techStackDetector, gitExtractor, _knowledgeStore);
    }

    [Fact]
    public async Task ScanLocalRepositoryAsync_ShouldScanDirectoryWithTildeAndExtractEntities()
    {
        var tempDir = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
        Directory.CreateDirectory(tempDir);

        try
        {
            var sampleCode = @"
namespace SampleApp.Services;

public interface IOrderService
{
    void ProcessOrder();
}

public class OrderService : IOrderService
{
    public void ProcessOrder() { }
}";

            File.WriteAllText(Path.Combine(tempDir, "OrderService.cs"), sampleCode);

            var result = await _scanner.ScanLocalRepositoryAsync(tempDir);

            Assert.NotNull(result);
            Assert.Equal(ExtractionStatus.Completed, result.Repository.Status);
            Assert.Contains(result.Entities, e => e.Name == "OrderService" && e.Type == EntityType.Service);
            Assert.Contains(result.Entities, e => e.Name == "IOrderService" && e.Type == EntityType.Interface);

            var storedResult = await _knowledgeStore.GetAnalysisAsync(result.Repository.Id);
            Assert.NotNull(storedResult);
            Assert.Equal(result.Repository.Id, storedResult.Repository.Id);
        }
        finally
        {
            if (Directory.Exists(tempDir)) Directory.Delete(tempDir, true);
        }
    }

    [Fact]
    public async Task ScanRepositoryAsync_ShouldDetectGitUrlAndScanGitHubRepo()
    {
        // Scan CodeAtlas repository itself as a Git / local target test
        var currentRepoPath = Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "../../../../../"));
        if (Directory.Exists(currentRepoPath))
        {
            var result = await _scanner.ScanRepositoryAsync(currentRepoPath);
            Assert.NotNull(result);
            Assert.Equal(ExtractionStatus.Completed, result.Repository.Status);
            Assert.NotEmpty(result.Entities);
        }
    }
}
