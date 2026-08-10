using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using RepoMind.Application.Abstractions;
using RepoMind.Domain.Models;

namespace RepoMind.Infrastructure.Git;

public class GitMetadataExtractor : IGitMetadataExtractor
{
    public Task<(string branch, string commitHash, string author, string message, List<GitCommitInfo> recentCommits)> ExtractGitInfoAsync(string repoRootPath)
    {
        var recentCommits = new List<GitCommitInfo>();
        var branch = "main";
        var commitHash = string.Empty;
        var author = string.Empty;
        var message = string.Empty;

        if (!Directory.Exists(Path.Combine(repoRootPath, ".git")))
        {
            return Task.FromResult((branch, commitHash, author, message, recentCommits));
        }

        try
        {
            branch = RunGitCommand(repoRootPath, "rev-parse --abbrev-ref HEAD") ?? "main";
            commitHash = RunGitCommand(repoRootPath, "rev-parse HEAD") ?? string.Empty;
            author = RunGitCommand(repoRootPath, "log -1 --pretty=format:%an") ?? string.Empty;
            message = RunGitCommand(repoRootPath, "log -1 --pretty=format:%s") ?? string.Empty;

            var logOutput = RunGitCommand(repoRootPath, "log -n 5 --pretty=format:%H|%an|%s|%cd --date=iso");
            if (!string.IsNullOrWhiteSpace(logOutput))
            {
                var lines = logOutput.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                foreach (var line in lines)
                {
                    var parts = line.Split('|');
                    if (parts.Length >= 3)
                    {
                        DateTime.TryParse(parts.Length >= 4 ? parts[3] : "", out var date);
                        recentCommits.Add(new GitCommitInfo
                        {
                            CommitHash = parts[0],
                            Author = parts[1],
                            Message = parts[2],
                            CommittedAt = date == default ? DateTime.UtcNow : date
                        });
                    }
                }
            }
        }
        catch
        {
            // Graceful fallback on Git CLI error
        }

        return Task.FromResult((branch, commitHash, author, message, recentCommits));
    }

    private string? RunGitCommand(string workingDir, string arguments)
    {
        try
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

            using var process = Process.Start(psi);
            if (process == null) return null;

            var output = process.StandardOutput.ReadToEnd().Trim();
            process.WaitForExit(3000);
            return process.ExitCode == 0 ? output : null;
        }
        catch
        {
            return null;
        }
    }
}
