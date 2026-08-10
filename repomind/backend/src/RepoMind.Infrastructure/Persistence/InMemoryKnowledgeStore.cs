using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RepoMind.Application.Abstractions;
using RepoMind.Domain.Models;

namespace RepoMind.Infrastructure.Persistence;

public class InMemoryKnowledgeStore : IKnowledgeStore
{
    private readonly ConcurrentDictionary<string, AnalysisResult> _store = new();

    public Task SaveAnalysisAsync(AnalysisResult result)
    {
        _store[result.Repository.Id] = result;
        return Task.CompletedTask;
    }

    public Task<AnalysisResult?> GetAnalysisAsync(string repositoryId)
    {
        _store.TryGetValue(repositoryId, out var result);
        return Task.FromResult(result);
    }

    public Task<List<RepositoryInfo>> ListRepositoriesAsync()
    {
        var repos = _store.Values.Select(v => v.Repository).ToList();
        return Task.FromResult(repos);
    }
}
