using System;
using System.Collections.Generic;

namespace CodeAtlas.Domain.Models;

public class UiComponentBlueprint
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "DashboardView"; // DashboardView, TableView, FormView, DetailView, CardView
    public string FilePath { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Props { get; set; } = new();
    public string MockDataJson { get; set; } = "{}";
}

public class UiPreviewDataResult
{
    public string RepositoryId { get; set; } = string.Empty;
    public string SelectedComponentId { get; set; } = string.Empty;
    public string ComponentName { get; set; } = string.Empty;
    public List<UiComponentBlueprint> DiscoveredComponents { get; set; } = new();
    public string MockDataJson { get; set; } = "{}";
    public bool IsStaticUi { get; set; } = false;
    public DateTimeOffset GeneratedAt { get; set; } = DateTimeOffset.UtcNow;
}
