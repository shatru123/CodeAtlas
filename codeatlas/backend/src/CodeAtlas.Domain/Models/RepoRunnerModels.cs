using System;
using System.Collections.Generic;

namespace CodeAtlas.Domain.Models;

public class CodeRunnerDetectionResult
{
    public string Language { get; set; } = "Unknown";
    public string Framework { get; set; } = "Generic";
    public string EntryPointFile { get; set; } = string.Empty;
    public string RecommendedCommand { get; set; } = string.Empty;
    public List<string> AvailableCommands { get; set; } = new();
    public bool RequiresBuild { get; set; }
}

public class ExecuteCodeRequest
{
    public string CustomCommand { get; set; } = string.Empty;
    public string WorkingDirectory { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 60;
}

public class CodeRunnerExecutionResult
{
    public string ProcessId { get; set; } = string.Empty;
    public string CommandExecuted { get; set; } = string.Empty;
    public string Status { get; set; } = "Completed"; // Running, Completed, Failed, Stopped
    public int ExitCode { get; set; }
    public double ExecutionDurationMs { get; set; }
    public string TerminalOutput { get; set; } = string.Empty;
    public string StandardError { get; set; } = string.Empty;
}
