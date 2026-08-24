using System.Diagnostics;
using CodeAtlas.Server.Models;

namespace CodeAtlas.Server.Services;

public interface IGitWorkspaceService
{
    Task<string> CloneRepositoryAsync(string repoUrl, string taskId, string? branch = "main");
    Task<FileTreeNode> GetFileTreeAsync(string taskId);
    Task<string> ReadFileAsync(string taskId, string relativePath, int? startLine = null, int? endLine = null);
    Task WriteFileAsync(string taskId, string relativePath, string content);
    Task<List<CodeDiffModel>> GetGitDiffsAsync(string taskId);
    Task<bool> CreateBranchAndCommitAsync(string taskId, string branchName, string commitMessage);
    string GetWorkspacePath(string taskId);
}

public class GitWorkspaceService : IGitWorkspaceService
{
    private readonly string _baseWorkspaceDir;
    private readonly ILogger<GitWorkspaceService> _logger;

    public GitWorkspaceService(IHostEnvironment environment, ILogger<GitWorkspaceService> logger)
    {
        _logger = logger;
        _baseWorkspaceDir = Path.Combine(environment.ContentRootPath, "workspaces");
        if (!Directory.Exists(_baseWorkspaceDir))
        {
            Directory.CreateDirectory(_baseWorkspaceDir);
        }
    }

    public string GetWorkspacePath(string taskId)
    {
        return Path.Combine(_baseWorkspaceDir, taskId);
    }

    public async Task<string> CloneRepositoryAsync(string repoUrl, string taskId, string? branch = "main")
    {
        var targetDir = GetWorkspacePath(taskId);
        if (Directory.Exists(targetDir))
        {
            Directory.Delete(targetDir, true);
        }

        _logger.LogInformation("Cloning {RepoUrl} into {TargetDir}", repoUrl, targetDir);

        var args = $"clone --depth 50 {repoUrl} \"{targetDir}\"";
        var result = await RunGitCommandAsync(Directory.GetCurrentDirectory(), args);

        if (result.ExitCode != 0)
        {
            throw new Exception($"Failed to clone repository: {result.Error}");
        }

        return targetDir;
    }

    public async Task<FileTreeNode> GetFileTreeAsync(string taskId)
    {
        var workspacePath = GetWorkspacePath(taskId);
        if (!Directory.Exists(workspacePath))
        {
            throw new DirectoryNotFoundException($"Workspace for task {taskId} not found.");
        }

        var rootInfo = new DirectoryInfo(workspacePath);
        return await Task.Run(() => BuildNode(rootInfo, workspacePath));
    }

    private FileTreeNode BuildNode(DirectoryInfo dirInfo, string rootPath)
    {
        var children = new List<FileTreeNode>();

        foreach (var subDir in dirInfo.GetDirectories())
        {
            if (subDir.Name.StartsWith(".") || subDir.Name.Equals("bin") || subDir.Name.Equals("obj") || subDir.Name.Equals("node_modules"))
                continue;

            children.Add(BuildNode(subDir, rootPath));
        }

        foreach (var file in dirInfo.GetFiles())
        {
            if (file.Name.StartsWith(".")) continue;
            var relPath = Path.GetRelativePath(rootPath, file.FullName);
            children.Add(new FileTreeNode(file.Name, relPath, false, null, file.Length));
        }

        var relativeDirPath = Path.GetRelativePath(rootPath, dirInfo.FullName);
        return new FileTreeNode(dirInfo.Name, relativeDirPath == "." ? "" : relativeDirPath, true, children);
    }

    public async Task<string> ReadFileAsync(string taskId, string relativePath, int? startLine = null, int? endLine = null)
    {
        var fullPath = Path.Combine(GetWorkspacePath(taskId), relativePath);
        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException($"File not found: {relativePath}");
        }

        var lines = await File.ReadAllLinesAsync(fullPath);
        if (startLine.HasValue || endLine.HasValue)
        {
            var start = Math.Max(0, (startLine ?? 1) - 1);
            var count = Math.Min(lines.Length - start, (endLine ?? lines.Length) - start);
            return string.Join(Environment.NewLine, lines.Skip(start).Take(Math.Max(0, count)));
        }

        return string.Join(Environment.NewLine, lines);
    }

    public async Task WriteFileAsync(string taskId, string relativePath, string content)
    {
        var fullPath = Path.Combine(GetWorkspacePath(taskId), relativePath);
        var dir = Path.GetDirectoryName(fullPath);
        if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
        {
            Directory.CreateDirectory(dir);
        }

        await File.WriteAllTextAsync(fullPath, content);
    }

    public async Task<List<CodeDiffModel>> GetGitDiffsAsync(string taskId)
    {
        var workspacePath = GetWorkspacePath(taskId);
        var statusResult = await RunGitCommandAsync(workspacePath, "status --porcelain");

        var diffs = new List<CodeDiffModel>();
        if (string.IsNullOrWhiteSpace(statusResult.Output)) return diffs;

        var diffResult = await RunGitCommandAsync(workspacePath, "diff");
        var diffText = diffResult.Output;

        var modifiedFiles = statusResult.Output
            .Split(Environment.NewLine, StringSplitOptions.RemoveEmptyEntries)
            .Select(line => line.Substring(3).Trim())
            .ToList();

        foreach (var file in modifiedFiles)
        {
            var fullPath = Path.Combine(workspacePath, file);
            var modifiedContent = File.Exists(fullPath) ? await File.ReadAllTextAsync(fullPath) : "";
            
            var originalResult = await RunGitCommandAsync(workspacePath, $"show HEAD:\"{file}\"");
            var originalContent = originalResult.ExitCode == 0 ? originalResult.Output : "";

            diffs.Add(new CodeDiffModel(file, originalContent, modifiedContent, diffText));
        }

        return diffs;
    }

    public async Task<bool> CreateBranchAndCommitAsync(string taskId, string branchName, string commitMessage)
    {
        var workspacePath = GetWorkspacePath(taskId);
        
        var branchRes = await RunGitCommandAsync(workspacePath, $"checkout -b \"{branchName}\"");
        var addRes = await RunGitCommandAsync(workspacePath, "add .");
        var commitRes = await RunGitCommandAsync(workspacePath, $"commit -m \"{commitMessage}\"");

        return commitRes.ExitCode == 0;
    }

    private async Task<(int ExitCode, string Output, string Error)> RunGitCommandAsync(string workingDir, string arguments)
    {
        var psi = new ProcessStartInfo
        {
            FileName = "git",
            Arguments = arguments,
            WorkingDirectory = workingDir,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = new Process { StartInfo = psi };
        process.Start();

        var outputTask = process.StandardOutput.ReadToEndAsync();
        var errorTask = process.StandardError.ReadToEndAsync();

        await process.WaitForExitAsync();

        return (process.ExitCode, await outputTask, await errorTask);
    }
}
