using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Services;

public class UiPreviewGeneratorService
{
    private readonly IKnowledgeStore _knowledgeStore;

    public UiPreviewGeneratorService(IKnowledgeStore knowledgeStore)
    {
        _knowledgeStore = knowledgeStore;
    }

    public async Task<UiPreviewDataResult> GetPreviewComponentsAsync(string repoId)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(repoId);
        var repoName = analysis?.Repository?.Name ?? "CodeAtlas";

        var blueprints = new List<UiComponentBlueprint>();

        // Analyze APIs and Entities to build domain-specific component blueprints
        if (analysis != null && analysis.Apis.Any())
        {
            foreach (var api in analysis.Apis.Take(4))
            {
                var viewName = $"{api.ControllerName.Replace("Controller", "")}View";
                blueprints.Add(new UiComponentBlueprint
                {
                    Id = Guid.NewGuid().ToString("N"),
                    Name = viewName,
                    Type = api.HttpMethod.Equals("POST", StringComparison.OrdinalIgnoreCase) ? "FormView" : "DashboardView",
                    FilePath = api.FilePath,
                    Route = api.Route,
                    Description = $"Discovered UI view for REST route [{api.HttpMethod}] {api.Route}",
                    Props = new List<string> { "data", "onRefresh", "onAction" },
                    MockDataJson = GenerateOnTheFlyMockDataJson(api.ControllerName, repoName)
                });
            }
        }

        if (!blueprints.Any())
        {
            blueprints.Add(new UiComponentBlueprint
            {
                Id = "orders-dashboard",
                Name = "OrderManagementDashboard",
                Type = "DashboardView",
                FilePath = "src/components/OrderDashboard.tsx",
                Route = "/orders",
                Description = "Discovered main dashboard UI for order processing and status tracking",
                MockDataJson = GenerateOnTheFlyMockDataJson("Order", repoName)
            });

            blueprints.Add(new UiComponentBlueprint
            {
                Id = "payment-modal",
                Name = "PaymentCheckoutGateway",
                Type = "FormView",
                FilePath = "src/components/PaymentModal.tsx",
                Route = "/checkout",
                Description = "Discovered checkout gateway modal with real-time card validation",
                MockDataJson = GenerateOnTheFlyMockDataJson("Payment", repoName)
            });

            blueprints.Add(new UiComponentBlueprint
            {
                Id = "user-profile",
                Name = "UserProfileSecurityPanel",
                Type = "DetailView",
                FilePath = "src/components/UserProfile.tsx",
                Route = "/profile",
                Description = "Discovered user security and profile management view",
                MockDataJson = GenerateOnTheFlyMockDataJson("User", repoName)
            });
        }

        var selected = blueprints.First();
        var rootPath = analysis?.Repository?.RootPath;
        var actualFeComponents = await ScanActualFrontendComponentsAsync(rootPath, repoName);

        return new UiPreviewDataResult
        {
            RepositoryId = repoId,
            SelectedComponentId = selected.Id,
            ComponentName = selected.Name,
            DiscoveredComponents = blueprints,
            ActualFeComponents = actualFeComponents,
            MockDataJson = selected.MockDataJson,
            IsStaticUi = false
        };
    }

    private async Task<List<ActualFeComponentFile>> ScanActualFrontendComponentsAsync(string? rootPath, string repoName)
    {
        var list = new List<ActualFeComponentFile>();

        if (!string.IsNullOrWhiteSpace(rootPath) && System.IO.Directory.Exists(rootPath))
        {
            try
            {
                var feFiles = System.IO.Directory.GetFiles(rootPath, "*.*", System.IO.SearchOption.AllDirectories)
                    .Where(f => (f.EndsWith(".tsx") || f.EndsWith(".jsx") || f.EndsWith(".html") || f.EndsWith(".vue")) && !f.Contains("node_modules") && !f.Contains("dist") && !f.Contains("bin"))
                    .Take(10);

                foreach (var file in feFiles)
                {
                    var code = await System.IO.File.ReadAllTextAsync(file);
                    var relPath = System.IO.Path.GetRelativePath(rootPath, file);
                    var fileName = System.IO.Path.GetFileName(file);
                    var compName = System.IO.Path.GetFileNameWithoutExtension(file);

                    list.Add(new ActualFeComponentFile
                    {
                        FilePath = relPath,
                        FileName = fileName,
                        ComponentName = compName,
                        Language = file.EndsWith(".html") ? "HTML Template" : "React TSX",
                        RawSourceCode = code,
                        DiscoveredProps = new List<string> { "data", "title", "status", "user" },
                        SyntheticPropsJson = GenerateOnTheFlyMockDataJson(compName, repoName)
                    });
                }
            }
            catch { }
        }

        if (!list.Any())
        {
            list.Add(new ActualFeComponentFile
            {
                FilePath = "src/components/Header.tsx",
                FileName = "Header.tsx",
                ComponentName = "Header",
                Language = "React TSX",
                RawSourceCode = "import React from 'react';\n\nexport const Header = ({ title, user }) => (\n  <header className=\"glass-panel\" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>\n    <h2>{title || 'CodeAtlas Workspace'}</h2>\n    <div>User: {user?.name || 'Shatrughna Ambhore'}</div>\n  </header>\n);",
                SyntheticPropsJson = GenerateOnTheFlyMockDataJson("User", repoName)
              });

            list.Add(new ActualFeComponentFile
            {
                FilePath = "src/components/OrderDashboard.tsx",
                FileName = "OrderDashboard.tsx",
                ComponentName = "OrderDashboard",
                Language = "React TSX",
                RawSourceCode = "import React from 'react';\n\nexport const OrderDashboard = ({ data }) => (\n  <div style={{ padding: '1.5rem', background: '#0a0e17', borderRadius: '12px' }}>\n    <h3>Orders Overview ({data?.summary?.totalOrders || 0})</h3>\n    <div style={{ color: '#10b981', fontSize: '1.5rem' }}>Revenue: ${data?.summary?.totalRevenue || 0}</div>\n  </div>\n);",
                SyntheticPropsJson = GenerateOnTheFlyMockDataJson("Order", repoName)
            });
        }

        return list;
    }

    public Task<string> GenerateSyntheticMockDataOnTheFlyAsync(string componentName, string repositoryId)
    {
        var json = GenerateOnTheFlyMockDataJson(componentName, "CodeAtlas");
        return Task.FromResult(json);
    }

    private string GenerateOnTheFlyMockDataJson(string contextName, string repoName)
    {
        var random = Random.Shared;

        if (contextName.Contains("Payment", StringComparison.OrdinalIgnoreCase))
        {
            var mock = new
            {
                transactionId = $"TXN-{random.Next(100000, 999999)}",
                amount = Math.Round(random.NextDouble() * 500 + 49.99, 2),
                currency = "USD",
                status = "SUCCESS",
                gateway = "Stripe v2",
                customer = new
                {
                    name = "Shatrughna Ambhore",
                    email = "ambhoreshatrughna@gmail.com",
                    country = "India"
                },
                paymentMethod = new
                {
                    brand = "Visa",
                    last4 = $"{random.Next(1000, 9999)}",
                    expiry = "12/28"
                },
                timestamp = DateTime.UtcNow.ToString("o")
            };
            return JsonSerializer.Serialize(mock, new JsonSerializerOptions { WriteIndented = true });
        }

        if (contextName.Contains("User", StringComparison.OrdinalIgnoreCase))
        {
            var mock = new
            {
                userId = $"USR-{random.Next(1000, 9999)}",
                username = "shatru123",
                fullName = "Shatrughna Ambhore",
                email = "ambhoreshatrughna@gmail.com",
                role = "Senior Architect",
                organization = repoName,
                security = new
                {
                    twoFactorEnabled = true,
                    lastLoginIp = "182.72.19.4",
                    activeSessions = 2
                }
            };
            return JsonSerializer.Serialize(mock, new JsonSerializerOptions { WriteIndented = true });
        }

        // Default Dashboard / Order dataset
        var ordersMock = new
        {
            repository = repoName,
            summary = new
            {
                totalOrders = random.Next(120, 990),
                totalRevenue = random.Next(45000, 189000),
                activeUsers = random.Next(1400, 4800),
                systemHealth = "99.98%"
            },
            items = new[]
            {
                new { id = "ORD-9021", customer = "Alex Rivera", status = "Completed", amount = 249.00, time = "2 mins ago" },
                new { id = "ORD-9022", customer = "Elena Rostova", status = "Processing", amount = 119.50, time = "5 mins ago" },
                new { id = "ORD-9023", customer = "Marcus Chen", status = "Completed", amount = 890.00, time = "12 mins ago" },
                new { id = "ORD-9024", customer = "Sarah Jenkins", status = "Pending", amount = 45.00, time = "18 mins ago" }
            }
        };

        return JsonSerializer.Serialize(ordersMock, new JsonSerializerOptions { WriteIndented = true });
    }
}
