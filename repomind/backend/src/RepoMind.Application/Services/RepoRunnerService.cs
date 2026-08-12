using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RepoMind.Domain.Models;

namespace RepoMind.Application.Services;

public class RepoRunnerService
{
    private static readonly ConcurrentDictionary<string, Process> ActiveProcesses = new();

    public static CodeRunnerDetectionResult DetectRuntime(string rootPath)
    {
        var result = new CodeRunnerDetectionResult();

        if (string.IsNullOrWhiteSpace(rootPath) || !Directory.Exists(rootPath))
        {
            result.RecommendedCommand = "echo 'Repository path not found'";
            return result;
        }

        var files = Directory.GetFiles(rootPath, "*", SearchOption.AllDirectories)
                             .Take(1000)
                             .ToList();

        // 1. C# / .NET
        var csproj = files.FirstOrDefault(f => f.EndsWith(".csproj", StringComparison.OrdinalIgnoreCase));
        var sln = files.FirstOrDefault(f => f.EndsWith(".sln", StringComparison.OrdinalIgnoreCase));
        if (csproj != null || sln != null)
        {
            result.Language = "C#";
            result.Framework = ".NET 8 / Core";
            result.EntryPointFile = Path.GetFileName(csproj ?? sln ?? "");
            result.RecommendedCommand = "dotnet run";
            result.AvailableCommands = new List<string> { "dotnet run", "dotnet build", "dotnet test" };
            result.RequiresBuild = true;
            return result;
        }

        // 2. Node.js / TypeScript / React / Next.js
        var packageJson = files.FirstOrDefault(f => Path.GetFileName(f).Equals("package.json", StringComparison.OrdinalIgnoreCase));
        if (packageJson != null)
        {
            result.Language = "TypeScript / JavaScript";
            result.Framework = "Node.js";
            result.EntryPointFile = "package.json";
            result.RecommendedCommand = "npm start";
            result.AvailableCommands = new List<string> { "npm start", "npm run dev", "npm test", "node index.js" };
            return result;
        }

        // 3. Python
        var pyFiles = files.Where(f => f.EndsWith(".py", StringComparison.OrdinalIgnoreCase)).ToList();
        if (pyFiles.Any())
        {
            result.Language = "Python";
            result.Framework = "Python 3";
            var mainPy = pyFiles.FirstOrDefault(f => Path.GetFileName(f).Equals("main.py", StringComparison.OrdinalIgnoreCase) ||
                                                     Path.GetFileName(f).Equals("app.py", StringComparison.OrdinalIgnoreCase) ||
                                                     Path.GetFileName(f).Equals("manage.py", StringComparison.OrdinalIgnoreCase))
                         ?? pyFiles.First();
            result.EntryPointFile = Path.GetRelativePath(rootPath, mainPy);
            result.RecommendedCommand = $"python3 {result.EntryPointFile}";
            result.AvailableCommands = new List<string> { $"python3 {result.EntryPointFile}", "pytest", "python3 -m unittest" };
            return result;
        }

        // 4. Java
        var pomXml = files.FirstOrDefault(f => Path.GetFileName(f).Equals("pom.xml", StringComparison.OrdinalIgnoreCase));
        var gradle = files.FirstOrDefault(f => Path.GetFileName(f).Equals("build.gradle", StringComparison.OrdinalIgnoreCase));
        if (pomXml != null || gradle != null)
        {
            result.Language = "Java";
            result.Framework = pomXml != null ? "Maven" : "Gradle";
            result.EntryPointFile = Path.GetFileName(pomXml ?? gradle ?? "");
            result.RecommendedCommand = pomXml != null ? "./mvnw spring-boot:run" : "./gradlew bootRun";
            result.AvailableCommands = new List<string> { result.RecommendedCommand, pomXml != null ? "mvn compile" : "gradle build" };
            result.RequiresBuild = true;
            return result;
        }

        // 5. Go
        var goMod = files.FirstOrDefault(f => Path.GetFileName(f).Equals("go.mod", StringComparison.OrdinalIgnoreCase));
        var goFiles = files.Where(f => f.EndsWith(".go", StringComparison.OrdinalIgnoreCase)).ToList();
        if (goMod != null || goFiles.Any())
        {
            result.Language = "Go";
            result.Framework = "Go Modules";
            var mainGo = goFiles.FirstOrDefault(f => Path.GetFileName(f).Equals("main.go", StringComparison.OrdinalIgnoreCase)) ?? goFiles.FirstOrDefault();
            result.EntryPointFile = mainGo != null ? Path.GetRelativePath(rootPath, mainGo) : ".";
            result.RecommendedCommand = $"go run {result.EntryPointFile}";
            result.AvailableCommands = new List<string> { $"go run {result.EntryPointFile}", "go build .", "go test ./..." };
            return result;
        }

        // 6. Rust
        var cargoToml = files.FirstOrDefault(f => Path.GetFileName(f).Equals("Cargo.toml", StringComparison.OrdinalIgnoreCase));
        if (cargoToml != null)
        {
            result.Language = "Rust";
            result.Framework = "Cargo";
            result.EntryPointFile = "Cargo.toml";
            result.RecommendedCommand = "cargo run";
            result.AvailableCommands = new List<string> { "cargo run", "cargo build", "cargo test" };
            result.RequiresBuild = true;
            return result;
        }

        // 7. Docker
        var dockerCompose = files.FirstOrDefault(f => Path.GetFileName(f).Equals("docker-compose.yml", StringComparison.OrdinalIgnoreCase) || Path.GetFileName(f).Equals("docker-compose.yaml", StringComparison.OrdinalIgnoreCase));
        if (dockerCompose != null)
        {
            result.Language = "Docker";
            result.Framework = "Docker Compose";
            result.EntryPointFile = Path.GetFileName(dockerCompose);
            result.RecommendedCommand = "docker-compose up";
            result.AvailableCommands = new List<string> { "docker-compose up", "docker-compose build" };
            return result;
        }

        result.RecommendedCommand = "ls -la";
        result.AvailableCommands = new List<string> { "ls -la" };
        return result;
    }

    public static async Task<CodeRunnerExecutionResult> ExecuteCommandAsync(string repoId, string rootPath, string commandLine, int timeoutSeconds = 30)
    {
        var result = new CodeRunnerExecutionResult
        {
            ProcessId = Guid.NewGuid().ToString("N"),
            CommandExecuted = commandLine,
            Status = "Running"
        };

        if (string.IsNullOrWhiteSpace(rootPath) || !Directory.Exists(rootPath))
        {
            result.Status = "Failed";
            result.StandardError = $"Root path '{rootPath}' does not exist on disk.";
            return result;
        }

        var sw = Stopwatch.StartNew();
        var outputBuilder = new StringBuilder();
        var errorBuilder = new StringBuilder();

        try
        {
            var fileName = "/bin/zsh";
            var args = $"-c \"{commandLine.Replace("\"", "\\\"")}\"";

            var psi = new ProcessStartInfo
            {
                FileName = fileName,
                Arguments = args,
                WorkingDirectory = rootPath,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = new Process { StartInfo = psi };

            process.OutputDataReceived += (_, e) =>
            {
                if (e.Data != null) outputBuilder.AppendLine(e.Data);
            };

            process.ErrorDataReceived += (_, e) =>
            {
                if (e.Data != null) errorBuilder.AppendLine(e.Data);
            };

            process.Start();
            ActiveProcesses[repoId] = process;

            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            var completed = await Task.Run(() => process.WaitForExit(timeoutSeconds * 1000));
            sw.Stop();

            if (!completed)
            {
                try { process.Kill(true); } catch { }
                result.Status = "TimedOut";
                result.StandardError = $"Process execution timed out after {timeoutSeconds} seconds.";
            }
            else
            {
                result.ExitCode = process.ExitCode;
                result.Status = process.ExitCode == 0 ? "Completed" : "Failed";
            }

            ActiveProcesses.TryRemove(repoId, out _);
        }
        catch (Exception ex)
        {
            sw.Stop();
            result.Status = "Failed";
            result.StandardError = ex.Message;
        }

        result.ExecutionDurationMs = sw.ElapsedMilliseconds;
        result.TerminalOutput = outputBuilder.ToString();
        if (errorBuilder.Length > 0 && string.IsNullOrWhiteSpace(result.StandardError))
        {
            result.StandardError = errorBuilder.ToString();
        }

        return result;
    }

    public static bool StopProcess(string repoId)
    {
        if (ActiveProcesses.TryRemove(repoId, out var process))
        {
            try
            {
                if (!process.HasExited)
                {
                    process.Kill(true);
                }
                return true;
            }
            catch
            {
                return false;
            }
        }
        return false;
    }
}
