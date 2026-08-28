using System;
using System.Collections.Generic;

namespace CodeAtlas.Domain.Models
{
    public class ModernizationReport
    {
        public int ModernizationScore { get; set; } = 92; // 0 to 100
        public string TargetFramework { get; set; } = ".NET 8.0";
        public string CurrentFramework { get; set; } = ".NET 8.0";
        public List<ModernizationItem> ActionItems { get; set; } = new List<ModernizationItem>();
        public List<PackageUpgradeItem> PackageUpgrades { get; set; } = new List<PackageUpgradeItem>();
    }

    public class ModernizationItem
    {
        public string Category { get; set; } = string.Empty; // "Minimal API", "Async I/O", "Dependency Injection", "Pattern Matching"
        public string Title { get; set; } = string.Empty;
        public string TargetFile { get; set; } = string.Empty;
        public string Impact { get; set; } = "High"; // "High", "Medium", "Low"
        public string CurrentCodeSnippet { get; set; } = string.Empty;
        public string RecommendedCodeSnippet { get; set; } = string.Empty;
        public string EffortEstimate { get; set; } = "5 mins";
    }

    public class PackageUpgradeItem
    {
        public string PackageName { get; set; } = string.Empty;
        public string CurrentVersion { get; set; } = string.Empty;
        public string LatestVersion { get; set; } = string.Empty;
        public bool IsBreakingChange { get; set; }
        public string Benefit { get; set; } = string.Empty;
    }
}
