using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace CodeAtlas.Server.Services;

public record CodeSymbol(
    string Name,
    string Kind, // Class, Interface, Method, Property, Enum
    string FilePath,
    int LineNumber,
    string Signature
);

public interface ICodeIndexerService
{
    Task<List<CodeSymbol>> IndexWorkspaceAsync(string workspacePath);
    Task<List<CodeSymbol>> SearchSymbolsAsync(string workspacePath, string query);
}

public class CodeIndexerService : ICodeIndexerService
{
    private readonly ILogger<CodeIndexerService> _logger;

    public CodeIndexerService(ILogger<CodeIndexerService> logger)
    {
        _logger = logger;
    }

    public async Task<List<CodeSymbol>> IndexWorkspaceAsync(string workspacePath)
    {
        var symbols = new List<CodeSymbol>();
        if (!Directory.Exists(workspacePath)) return symbols;

        var csFiles = Directory.GetFiles(workspacePath, "*.cs", SearchOption.AllDirectories)
            .Where(f => !f.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}") &&
                        !f.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}"))
            .ToList();

        foreach (var file in csFiles)
        {
            var relativePath = Path.GetRelativePath(workspacePath, file);
            var code = await File.ReadAllTextAsync(file);
            var tree = CSharpSyntaxTree.ParseText(code);
            var root = await tree.GetRootAsync();

            // Index Classes
            var classNodes = root.DescendantNodes().OfType<ClassDeclarationSyntax>();
            foreach (var cls in classNodes)
            {
                var line = cls.GetLocation().GetLineSpan().StartLinePosition.Line + 1;
                symbols.Add(new CodeSymbol(cls.Identifier.Text, "Class", relativePath, line, cls.Identifier.Text));
            }

            // Index Interfaces
            var interfaceNodes = root.DescendantNodes().OfType<InterfaceDeclarationSyntax>();
            foreach (var iface in interfaceNodes)
            {
                var line = iface.GetLocation().GetLineSpan().StartLinePosition.Line + 1;
                symbols.Add(new CodeSymbol(iface.Identifier.Text, "Interface", relativePath, line, iface.Identifier.Text));
            }

            // Index Methods
            var methodNodes = root.DescendantNodes().OfType<MethodDeclarationSyntax>();
            foreach (var method in methodNodes)
            {
                var line = method.GetLocation().GetLineSpan().StartLinePosition.Line + 1;
                var signature = $"{method.ReturnType} {method.Identifier}({string.Join(", ", method.ParameterList.Parameters.Select(p => p.Type + " " + p.Identifier))})";
                symbols.Add(new CodeSymbol(method.Identifier.Text, "Method", relativePath, line, signature));
            }
        }

        _logger.LogInformation("Indexed {Count} symbols across {FileCount} C# files in workspace", symbols.Count, csFiles.Count);
        return symbols;
    }

    public async Task<List<CodeSymbol>> SearchSymbolsAsync(string workspacePath, string query)
    {
        var allSymbols = await IndexWorkspaceAsync(workspacePath);
        return allSymbols
            .Where(s => s.Name.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                        s.Signature.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                        s.FilePath.Contains(query, StringComparison.OrdinalIgnoreCase))
            .Take(50)
            .ToList();
    }
}
