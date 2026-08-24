using Microsoft.AspNetCore.SignalR;
using CodeAtlas.Server.Models;

namespace CodeAtlas.Server.Hubs;

public interface IExecutionClient
{
    Task ReceiveAgentStep(AgentStepEvent step);
    Task ReceiveLogOutput(string taskId, string source, string message);
    Task ReceiveCodeDiff(string taskId, CodeDiffModel diff);
    Task ReceiveBuildOutput(string taskId, string outputLine, bool isError);
    Task ReceiveTaskStatus(string taskId, string status, string currentAgent);
}

public class ExecutionHub : Hub<IExecutionClient>
{
    public async Task JoinTaskGroup(string taskId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"Task_{taskId}");
        await Clients.Caller.ReceiveLogOutput(taskId, "System", $"Connected to real-time execution stream for Task: {taskId}");
    }

    public async Task LeaveTaskGroup(string taskId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Task_{taskId}");
    }
}
