# Multi-stage Dockerfile for RepoMind .NET 8 Web API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj files for layer caching
COPY src/RepoMind.Domain/RepoMind.Domain.csproj src/RepoMind.Domain/
COPY src/RepoMind.Application/RepoMind.Application.csproj src/RepoMind.Application/
COPY src/RepoMind.Infrastructure/RepoMind.Infrastructure.csproj src/RepoMind.Infrastructure/
COPY src/RepoMind.Api/RepoMind.Api.csproj src/RepoMind.Api/

# Restore dependencies directly for API project
RUN dotnet restore src/RepoMind.Api/RepoMind.Api.csproj

# Copy all source code and publish
COPY src/ src/
RUN dotnet publish src/RepoMind.Api/RepoMind.Api.csproj -c Release -o /app/publish

# Runtime Image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "RepoMind.Api.dll"]
