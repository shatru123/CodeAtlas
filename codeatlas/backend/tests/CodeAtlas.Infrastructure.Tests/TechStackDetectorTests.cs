using System.IO;
using System.Threading.Tasks;
using CodeAtlas.Infrastructure.Detectors;
using Xunit;

namespace CodeAtlas.Infrastructure.Tests;

public class TechStackDetectorTests
{
    private readonly TechStackDetector _detector;

    public TechStackDetectorTests()
    {
        _detector = new TechStackDetector();
    }

    [Fact]
    public async Task DetectTechStackAsync_ShouldDetectDotNetAndPackages()
    {
        var tempDir = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
        Directory.CreateDirectory(tempDir);

        try
        {
            var csProjContent = @"<Project Sdk=""Microsoft.NET.Sdk"">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include=""Microsoft.AspNetCore.App"" />
    <PackageReference Include=""Microsoft.EntityFrameworkCore.SqlServer"" />
    <PackageReference Include=""MassTransit.RabbitMQ"" />
  </ItemGroup>
</Project>";

            File.WriteAllText(Path.Combine(tempDir, "TestApp.csproj"), csProjContent);
            File.WriteAllText(Path.Combine(tempDir, "Dockerfile"), "FROM mcr.microsoft.com/dotnet/aspnet:8.0");

            var techStack = await _detector.DetectTechStackAsync(tempDir);
            var languages = await _detector.DetectLanguagesAsync(tempDir);

            Assert.Contains(".NET", techStack);
            Assert.Contains("C#", techStack);
            Assert.Contains("ASP.NET Core", techStack);
            Assert.Contains("Entity Framework Core", techStack);
            Assert.Contains("RabbitMQ", techStack);
            Assert.Contains("Docker", techStack);
            Assert.Contains("C#", languages);
        }
        finally
        {
            if (Directory.Exists(tempDir)) Directory.Delete(tempDir, true);
        }
    }
}
