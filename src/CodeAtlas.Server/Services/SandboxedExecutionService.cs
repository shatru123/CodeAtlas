using System.Diagnostics;

namespace CodeAtlas.Server.Services;

public record CommandExecutionResult(
    int ExitCode,
    string StandardOutput,
    string StandardError,
    TimeSpan Duration
);

public interface ISandboxedExecutionService
{
    Task<CommandExecutionResult> ExecuteCommandAsync(
        string workspacePath,
        string command,
        string arguments,
        Func<string, bool, Task>? onOutputLine = null
    );
}

public class SandboxedExecutionService : ISandboxedExecutionService
{
    private readonly ILogger<SandboxedExecutionService> _logger;

    public SandboxedExecutionService(ILogger<SandboxedExecutionService> logger)
    {
        _logger = logger;
    }

    public async Task<CommandExecutionResult> ExecuteCommandAsync(
        string workspacePath,
        string command,
        string arguments,
        Func<string, bool, Task>? onOutputLine = null)
    {
        _logger.LogInformation("Executing process '{Command} {Arguments}' in {WorkspacePath}", command, arguments, workspacePath);

        var stopwatch = Stopwatch.StartNew();
        var stdOutBuilder = new List<string>();
        var stdErrBuilder = new List<string>();

        var psi = new ProcessStartInfo
        {
            FileName = command,
            Arguments = arguments,
            WorkingDirectory = workspacePath,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        // Ensure DOTNET_ROOT environment variable is available for dotnet CLI commands
        var dotnetRoot = Environment.GetEnvironmentVariable("DOTNET_ROOT") ?? Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".dotnet");
        if (Directory.Exists(dotnetRoot))
        {
            psi.EnvironmentVariables["DOTNET_ROOT"] = dotnetRoot;
            psi.EnvironmentVariables["PATH"] = $"{dotnetRoot}:{Environment.GetEnvironmentVariable("PATH")}";
        }

        using var process = new Process { StartInfo = psi };

        process.OutputDataReceived += async (_, e) =>
        {
            if (e.Data != null)
            {
                stdOutBuilder.Add(e.Data);
                if (onOutputLine != null)
                {
                    await onOutputLine(e.Data, false);
                }
            }
        };

        process.ErrorDataReceived += async (_, e) =>
        {
            if (e.Data != null)
            {
                stdErrBuilder.Add(e.Data);
                if (onOutputLine != null)
                {
                    await onOutputLine(e.Data, true);
                }
            }
        };

        process.Start();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();

        await process.WaitForExitAsync();
        stopwatch.Stop();

        var stdout = string.Join(Environment.NewLine, stdOutBuilder);
        var stderr = string.Join(Environment.NewLine, stdErrBuilder);

        _logger.LogInformation("Execution finished in {Duration}ms with exit code {ExitCode}", stopwatch.ElapsedMilliseconds, process.ExitCode);

        return new CommandExecutionResult(process.ExitCode, stdout, stderr, stopwatch.Elapsed);
    }
}
