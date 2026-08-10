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
    [Fact]
    public async Task ScanRepositoryAsync_ShouldScanRepositoryAndSaveAnalysis()
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

            var parsers = new List<ILanguageParser> { new CSharpRoslynParser() };
            var techStackDetector = new TechStackDetector();
            var gitExtractor = new GitMetadataExtractor();
            var knowledgeStore = new InMemoryKnowledgeStore();

            var scanner = new RepositoryScannerService(parsers, techStackDetector, gitExtractor, knowledgeStore);

            var result = await scanner.ScanRepositoryAsync(tempDir);

            Assert.NotNull(result);
            Assert.Equal(ExtractionStatus.Completed, result.Repository.Status);
            Assert.Contains(result.Entities, e => e.Name == "OrderService" && e.Type == EntityType.Service);
            Assert.Contains(result.Entities, e => e.Name == "IOrderService" && e.Type == EntityType.Interface);

            var storedResult = await knowledgeStore.GetAnalysisAsync(result.Repository.Id);
            Assert.NotNull(storedResult);
            Assert.Equal(result.Repository.Id, storedResult.Repository.Id);
        }
        finally
        {
            if (Directory.Exists(tempDir)) Directory.Delete(tempDir, true);
        }
    }
}
