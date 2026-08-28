using System;
using System.Collections.Generic;

namespace CodeAtlas.Domain.Models
{
    public class TechDebtReport
    {
        public int HealthScore { get; set; } = 85; // 0 to 100
        public int TotalSmells { get; set; }
        public List<CodeSmellItem> CodeSmells { get; set; } = new List<CodeSmellItem>();
        public List<CircularDependencyItem> CircularDependencies { get; set; } = new List<CircularDependencyItem>();
        public List<DeadCodeItem> DeadCodeItems { get; set; } = new List<DeadCodeItem>();
        public List<RefactoringSuggestion> Suggestions { get; set; } = new List<RefactoringSuggestion>();
    }

    public class CodeSmellItem
    {
        public string EntityName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string SmellType { get; set; } = string.Empty; // "God Class", "High Complexity", "Too Many Dependencies", "Large File"
        public string Severity { get; set; } = "High"; // "High", "Medium", "Low"
        public string Description { get; set; } = string.Empty;
        public int LineCount { get; set; }
        public int MethodCount { get; set; }
    }

    public class CircularDependencyItem
    {
        public string FromEntity { get; set; } = string.Empty;
        public string ToEntity { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class DeadCodeItem
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "Class", "Method", "Endpoint"
        public string FilePath { get; set; } = string.Empty;
        public string Reason { get; set; } = "0 incoming references in AST Knowledge Graph";
    }

    public class RefactoringSuggestion
    {
        public string Title { get; set; } = string.Empty;
        public string TargetEntity { get; set; } = string.Empty;
        public string Pattern { get; set; } = string.Empty; // "Extract Service", "CQRS Split", "Interface Segregation"
        public string Impact { get; set; } = "High";
        public string Summary { get; set; } = string.Empty;
    }
}
