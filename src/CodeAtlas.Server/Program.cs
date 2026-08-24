using CodeAtlas.Server.Hubs;
using CodeAtlas.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers & Native .NET 9 OpenAPI
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Add SignalR for real-time streaming
builder.Services.AddSignalR();

// Register Custom Services
builder.Services.AddSingleton<IGitWorkspaceService, GitWorkspaceService>();
builder.Services.AddSingleton<ICodeIndexerService, CodeIndexerService>();
builder.Services.AddSingleton<ISandboxedExecutionService, SandboxedExecutionService>();
builder.Services.AddSingleton<IAgentOrchestratorService, AgentOrchestratorService>();

// Configure CORS for React UI integration (allow any origin on localhost)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");
app.UseAuthorization();

app.MapControllers();
app.MapHub<ExecutionHub>("/hubs/execution");

app.Run();
