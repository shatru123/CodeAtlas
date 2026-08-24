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

        // Expand ~ to user home directory if local path
        var normalizedRepoUrl = repoUrl.Trim();
        if (normalizedRepoUrl.StartsWith("~"))
        {
            var userHome = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            normalizedRepoUrl = Path.Combine(userHome, normalizedRepoUrl.Substring(1).TrimStart('/', '\\'));
        }

        _logger.LogInformation("Setting up workspace for {RepoUrl} into {TargetDir}", normalizedRepoUrl, targetDir);

        // Check if local directory exists
        if (Directory.Exists(normalizedRepoUrl))
        {
            // Attempt git clone first
            var cloneArgs = $"clone \"{normalizedRepoUrl}\" \"{targetDir}\"";
            var cloneResult = await RunGitCommandAsync(Directory.GetCurrentDirectory(), cloneArgs);

            if (cloneResult.ExitCode != 0)
            {
                _logger.LogWarning("Git clone of local directory failed, copying files directly: {Error}", cloneResult.Error);
                CopyDirectoryRecursively(normalizedRepoUrl, targetDir);
                await RunGitCommandAsync(targetDir, "init");
            }
        }
        else
        {
            var cloneArgs = $"clone --depth 50 {normalizedRepoUrl} \"{targetDir}\"";
            var result = await RunGitCommandAsync(Directory.GetCurrentDirectory(), cloneArgs);

            if (result.ExitCode != 0)
            {
                throw new Exception($"Failed to clone repository: {result.Error}");
            }
        }

        return targetDir;
    }

    private void CopyDirectoryRecursively(string sourceDir, string targetDir)
    {
        Directory.CreateDirectory(targetDir);

        foreach (var file in Directory.GetFiles(sourceDir))
        {
            var fileName = Path.GetFileName(file);
            File.Copy(file, Path.Combine(targetDir, fileName), true);
        }

        foreach (var subDir in Directory.GetDirectories(sourceDir))
        {
            var dirName = Path.GetFileName(subDir);
            if (dirName.Equals("bin", StringComparison.OrdinalIgnoreCase) ||
                dirName.Equals("obj", StringComparison.OrdinalIgnoreCase) ||
                dirName.Equals("node_modules", StringComparison.OrdinalIgnoreCase) ||
                dirName.Equals("dist", StringComparison.OrdinalIgnoreCase) ||
                dirName.Equals(".git", StringComparison.OrdinalIgnoreCase) ||
                dirName.Equals("workspaces", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            CopyDirectoryRecursively(subDir, Path.Combine(targetDir, dirName));
        }
    }

    public async Task<FileTreeNode> GetFileTreeAsync(string taskId)
    {
        var workspacePath = GetWorkspacePath(taskId);
        if (!Directory.Exists(workspacePath))
        {
            throw new DirectoryNotFoundException($"Workspace for task {taskId} not found.");
        }

        return await Task.Run(() => BuildFileTree(new DirectoryInfo(workspacePath), workspacePath));
    }

    private FileTreeNode BuildFileTree(DirectoryInfo dirInfo, string rootPath)
    {
        var relativePath = Path.GetRelativePath(rootPath, dirInfo.FullName);
        if (relativePath == ".") relativePath = "";

        var children = new List<FileTreeNode>();

        foreach (var subDir in dirInfo.GetDirectories())
        {
            if (subDir.Name.StartsWith(".") || subDir.Name == "bin" || subDir.Name == "obj" || subDir.Name == "node_modules")
                continue;

            children.Add(BuildFileTree(subDir, rootPath));
        }

        foreach (var file in dirInfo.GetFiles())
        {
            if (file.Name.StartsWith(".")) continue;

            children.Add(new FileTreeNode(
                file.Name,
                Path.GetRelativePath(rootPath, file.FullName),
                false,
                null,
                file.Length
            ));
        }

        return new FileTreeNode(
            dirInfo.Name,
            relativePath,
            true,
            children,
            null
        );
    }

    public async Task<string> ReadFileAsync(string taskId, string relativePath, int? startLine = null, int? endLine = null)
    {
        var workspacePath = GetWorkspacePath(taskId);
        var fullPath = Path.Combine(workspacePath, relativePath);

        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException($"File {relativePath} not found in workspace.");
        }

        var lines = await File.ReadAllLinesAsync(fullPath);

        if (startLine.HasValue && endLine.HasValue)
        {
            var start = Math.Max(0, startLine.Value - 1);
            var count = Math.Min(lines.Length - start, endLine.Value - startLine.Value + 1);
            return string.Join(Environment.NewLine, lines.Skip(start).Take(count));
        }

        return string.Join(Environment.NewLine, lines);
    }

    public async Task WriteFileAsync(string taskId, string relativePath, string content)
    {
        var workspacePath = GetWorkspacePath(taskId);
        var fullPath = Path.Combine(workspacePath, relativePath);

        var parentDir = Path.GetDirectoryName(fullPath);
        if (!string.IsNullOrEmpty(parentDir) && !Directory.Exists(parentDir))
        {
            Directory.CreateDirectory(parentDir);
        }

        await File.WriteAllTextAsync(fullPath, content);
    }

    public async Task<List<CodeDiffModel>> GetGitDiffsAsync(string taskId)
    {
        var workspacePath = GetWorkspacePath(taskId);
        var diffs = new List<CodeDiffModel>();

        var statusResult = await RunGitCommandAsync(workspacePath, "status --porcelain");
        if (statusResult.ExitCode != 0 || string.IsNullOrWhiteSpace(statusResult.Output))
        {
            return diffs;
        }

        var lines = statusResult.Output.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        foreach (var line in lines)
        {
            if (line.Length < 4) continue;
            var filePath = line.Substring(3).Trim();

            var diffResult = await RunGitCommandAsync(workspacePath, $"diff HEAD -- \"{filePath}\"");
            var diffText = diffResult.Output;

            var originalContent = "";
            try
            {
                var showResult = await RunGitCommandAsync(workspacePath, $"show HEAD:\"{filePath}\"");
                if (showResult.ExitCode == 0) originalContent = showResult.Output;
            }
            catch { }

            var fullPath = Path.Combine(workspacePath, filePath);
            var modifiedContent = File.Exists(fullPath) ? await File.ReadAllTextAsync(fullPath) : "";

            diffs.Add(new CodeDiffModel(
                filePath,
                originalContent,
                modifiedContent,
                diffText
            ));
        }

        return diffs;
    }

    public async Task<bool> CreateBranchAndCommitAsync(string taskId, string branchName, string commitMessage)
    {
        var workspacePath = GetWorkspacePath(taskId);

        await RunGitCommandAsync(workspacePath, $"checkout -b \"{branchName}\"");
        await RunGitCommandAsync(workspacePath, "add .");
        var commitResult = await RunGitCommandAsync(workspacePath, $"commit -m \"{commitMessage}\"");

        return commitResult.ExitCode == 0;
    }

    private async Task<(int ExitCode, string Output, string Error)> RunGitCommandAsync(string workingDir, string args)
    {
        var psi = new ProcessStartInfo
        {
            FileName = "git",
            Arguments = args,
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
