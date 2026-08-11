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

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { }
