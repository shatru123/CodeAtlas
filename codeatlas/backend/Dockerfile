# Multi-stage Dockerfile for CodeAtlas .NET 8 Web API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj files for layer caching
COPY src/CodeAtlas.Domain/CodeAtlas.Domain.csproj src/CodeAtlas.Domain/
COPY src/CodeAtlas.Application/CodeAtlas.Application.csproj src/CodeAtlas.Application/
COPY src/CodeAtlas.Infrastructure/CodeAtlas.Infrastructure.csproj src/CodeAtlas.Infrastructure/
COPY src/CodeAtlas.Api/CodeAtlas.Api.csproj src/CodeAtlas.Api/

# Restore dependencies directly for API project
RUN dotnet restore src/CodeAtlas.Api/CodeAtlas.Api.csproj

# Copy all source code and publish
COPY src/ src/
RUN dotnet publish src/CodeAtlas.Api/CodeAtlas.Api.csproj -c Release -o /app/publish

# Runtime Image with Git CLI installed
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install git CLI
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV DOTNET_USE_POLLING_FILE_WATCHER=true
ENV DOTNET_SYSTEM_IO_DISABLEFILEWATCHING=true
EXPOSE 8080

ENTRYPOINT ["dotnet", "CodeAtlas.Api.dll"]
