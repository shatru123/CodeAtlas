using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RepoMind.Api.Controllers;
using RepoMind.Api.Dtos;
using RepoMind.Application.Abstractions;
using RepoMind.Domain.Models;
using RepoMind.Infrastructure.Detectors;
using RepoMind.Infrastructure.Git;
using RepoMind.Infrastructure.Parsers;
using RepoMind.Infrastructure.Persistence;
using Xunit;

namespace RepoMind.Api.Tests;

public class ApiControllerTests
{
    [Fact]
    public async Task RepositoriesController_ListRepositories_ReturnsOkResult()
    {
        var knowledgeStore = new InMemoryKnowledgeStore();
        var scanner = new RepoMind.Application.Services.RepositoryScannerService(
            new[] { new CSharpRoslynParser() },
            new TechStackDetector(),
            new GitMetadataExtractor(),
            knowledgeStore);

        var controller = new RepositoriesController(scanner, knowledgeStore);

        var result = await controller.ListRepositories();

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }
}
