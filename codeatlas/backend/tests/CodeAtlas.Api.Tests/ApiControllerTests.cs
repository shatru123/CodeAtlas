using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CodeAtlas.Api.Controllers;
using CodeAtlas.Api.Dtos;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Domain.Models;
using CodeAtlas.Infrastructure.Detectors;
using CodeAtlas.Infrastructure.Git;
using CodeAtlas.Infrastructure.Parsers;
using CodeAtlas.Infrastructure.Persistence;
using Xunit;

namespace CodeAtlas.Api.Tests;

public class ApiControllerTests
{
    [Fact]
    public async Task RepositoriesController_ListRepositories_ReturnsOkResult()
    {
        var knowledgeStore = new InMemoryKnowledgeStore();
        var scanner = new CodeAtlas.Application.Services.RepositoryScannerService(
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
