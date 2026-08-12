using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using RepoMind.Application.Abstractions;
using RepoMind.Application.Services;
using RepoMind.Infrastructure.Detectors;
using RepoMind.Infrastructure.Git;
using RepoMind.Infrastructure.Parsers;
using RepoMind.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to DI container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Enable CORS for frontend deployment
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register Clean Architecture dependencies
builder.Services.AddSingleton<IKnowledgeStore, InMemoryKnowledgeStore>();

// Register Multi-Language Parsers
builder.Services.AddTransient<ILanguageParser, CSharpRoslynParser>();
builder.Services.AddTransient<ILanguageParser, PythonParser>();
builder.Services.AddTransient<ILanguageParser, TypeScriptParser>();
builder.Services.AddTransient<ILanguageParser, GenericCodeParser>();

builder.Services.AddTransient<ITechStackDetector, TechStackDetector>();
builder.Services.AddTransient<IGitMetadataExtractor, GitMetadataExtractor>();
builder.Services.AddTransient<IRepositoryScanner, RepositoryScannerService>();

var app = builder.Build();

app.UseCors("AllowAll");

// Enable Swagger UI on all environments (including production root /)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "RepoMind API v2.5");
    c.RoutePrefix = "swagger";
});

app.MapGet("/", () => Results.Ok(new
{
    status = "Live",
    service = "RepoMind Backend API v2.5",
    swagger = "/swagger",
    documentation = "https://github.com/shatru123/CodeAtlas"
}));

app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { }
