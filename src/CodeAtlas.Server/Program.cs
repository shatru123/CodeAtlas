using CodeAtlas.Server.Hubs;
using CodeAtlas.Server.Services;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers & OpenAPI/Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add SignalR for real-time streaming
builder.Services.AddSignalR();

// Register Custom Services
builder.Services.AddSingleton<IGitWorkspaceService, GitWorkspaceService>();
builder.Services.AddSingleton<ICodeIndexerService, CodeIndexerService>();
builder.Services.AddSingleton<ISandboxedExecutionService, SandboxedExecutionService>();
builder.Services.AddSingleton<IAgentOrchestratorService, AgentOrchestratorService>();

// Configure CORS for React UI integration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:5000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthorization();

app.MapControllers();
app.MapHub<ExecutionHub>("/hubs/execution");

app.Run();
