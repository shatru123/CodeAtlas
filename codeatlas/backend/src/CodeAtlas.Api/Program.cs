using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Application.Services;
using CodeAtlas.Infrastructure.Detectors;
using CodeAtlas.Infrastructure.Git;
using CodeAtlas.Infrastructure.Parsers;
using CodeAtlas.Infrastructure.Persistence;

var options = new WebApplicationOptions
{
    Args = args,
    ContentRootPath = Directory.GetCurrentDirectory()
};

var builder = WebApplication.CreateBuilder(options);

// Disable reloadOnChange on all file configuration providers to prevent inotify limit crashes in cloud container environments
foreach (var source in builder.Configuration.Sources.OfType<FileConfigurationSource>())
{
    source.ReloadOnChange = false;
}

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
builder.Services.AddTransient<GeminiAiService>();

var app = builder.Build();

app.UseCors("AllowAll");

// Enable Swagger UI on all environments (including production root /)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "CodeAtlas API v2.5");
    c.RoutePrefix = "swagger";
});

app.MapGet("/", () => Results.Ok(new
{
    status = "Live",
    service = "CodeAtlas Backend API v2.5",
    swagger = "/swagger",
    documentation = "https://github.com/shatru123/CodeAtlas"
}));

app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { }
