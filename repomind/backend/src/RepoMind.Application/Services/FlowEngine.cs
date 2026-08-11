using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using RepoMind.Domain.Models;

namespace RepoMind.Application.Services;

public class FlowEngine
{
    public static List<FunctionalFlow> SynthesizeFlows(AnalysisResult result)
    {
        var flows = new List<FunctionalFlow>();

        // Synthesize flows starting from REST API endpoints
        foreach (var api in result.Apis)
        {
            var flowId = Guid.NewGuid().ToString();
            var title = $"{api.HttpMethod} {api.Route} Execution Flow";
            var description = $"End-to-end execution flow triggered by {api.HttpMethod} {api.Route} via {api.ControllerName}.{api.ActionName}()";

            var steps = new List<FunctionalFlowStep>();
            var mermaidBuilder = new StringBuilder();
            mermaidBuilder.AppendLine("graph TD");
            mermaidBuilder.AppendLine("    classDef apiStyle fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff,rx:8,ry:8;");
            mermaidBuilder.AppendLine("    classDef ctrlStyle fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#fff,rx:8,ry:8;");
            mermaidBuilder.AppendLine("    classDef svcStyle fill:#2e1065,stroke:#a855f7,stroke-width:2px,color:#fff,rx:8,ry:8;");
            mermaidBuilder.AppendLine("    classDef dbStyle fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff,rx:8,ry:8;");
            mermaidBuilder.AppendLine("    classDef eventStyle fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#fff,rx:8,ry:8;");

            // Step 1: HTTP Client Request
            var clientNodeId = "ClientRequest";
            mermaidBuilder.AppendLine($"    {clientNodeId}[\"🌐 HTTP {api.HttpMethod} {api.Route}\"]:::apiStyle");

            steps.Add(new FunctionalFlowStep
            {
                StepNumber = 1,
                NodeName = $"HTTP {api.HttpMethod} {api.Route}",
                NodeType = "API",
                Description = "Client sends incoming HTTP request to API gateway / route",
                FilePath = api.FilePath,
                LineNumber = api.LineNumber
            });

            // Step 2: Controller Action
            var controllerNodeId = SanitizeNodeId(api.ControllerName);
            mermaidBuilder.AppendLine($"    {clientNodeId} -->|\"Incoming Request\"| {controllerNodeId}[\"🎮 {api.ControllerName}.{api.ActionName}()\"]:::ctrlStyle");

            steps.Add(new FunctionalFlowStep
            {
                StepNumber = 2,
                NodeName = $"{api.ControllerName}.{api.ActionName}()",
                NodeType = "Controller",
                Description = "Handles HTTP protocol, validates request DTO, and delegates execution",
                FilePath = api.FilePath,
                LineNumber = api.LineNumber
            });

            var prevNodeId = controllerNodeId;

            // Step 3: Find Service dependencies called by Controller
            var controllerEntity = result.Entities.FirstOrDefault(e => e.Name == api.ControllerName || e.FullName.EndsWith(api.ControllerName));
            if (controllerEntity != null)
            {
                var serviceRels = result.Relationships.Where(r => r.SourceEntityId == controllerEntity.Id && r.Type == RelationshipType.DependsOn).ToList();
                foreach (var sRel in serviceRels)
                {
                    var serviceNodeId = SanitizeNodeId(sRel.TargetFullName);
                    mermaidBuilder.AppendLine($"    {prevNodeId} -->|\"Executes Business Logic\"| {serviceNodeId}[\"⚙️ Service: {sRel.TargetFullName}\"]:::svcStyle");

                    steps.Add(new FunctionalFlowStep
                    {
                        StepNumber = steps.Count + 1,
                        NodeName = sRel.TargetFullName,
                        NodeType = "Service",
                        Description = "Executes core application domain logic & business rules validation",
                        FilePath = sRel.FilePath,
                        LineNumber = sRel.LineNumber
                    });

                    prevNodeId = serviceNodeId;
                }
            }

            // Step 4: Database References & Tables
            var dbOps = result.Databases.Where(d => d.FilePath == api.FilePath || (controllerEntity != null && d.SourceEntity == controllerEntity.FullName)).ToList();
            foreach (var db in dbOps)
            {
                var dbNodeId = SanitizeNodeId($"DB_{db.TableName}");
                mermaidBuilder.AppendLine($"    {prevNodeId} -->|\"{db.Operation} Query ({db.OrmProvider})\"| {dbNodeId}[(\"🗄️ DB Table: {db.TableName}\")]:::dbStyle");

                steps.Add(new FunctionalFlowStep
                {
                    StepNumber = steps.Count + 1,
                    NodeName = db.TableName,
                    NodeType = "Database",
                    Description = $"Executes {db.Operation} query against database table {db.TableName} via {db.OrmProvider}",
                    FilePath = db.FilePath,
                    LineNumber = db.LineNumber
                });
            }

            // Step 5: Events Published / Consumed
            foreach (var ev in result.Events)
            {
                var evNodeId = SanitizeNodeId($"Event_{ev.EventName}");
                mermaidBuilder.AppendLine($"    {prevNodeId} -->|\"Publish/Consume Message\"| {evNodeId}[\"📡 Event: {ev.EventName} ({ev.Role})\"]:::eventStyle");

                steps.Add(new FunctionalFlowStep
                {
                    StepNumber = steps.Count + 1,
                    NodeName = ev.EventName,
                    NodeType = "Event",
                    Description = $"{ev.Role} async message event over {ev.Broker} message broker",
                    FilePath = ev.FilePath,
                    LineNumber = ev.LineNumber
                });
            }

            flows.Add(new FunctionalFlow
            {
                Id = flowId,
                RepositoryId = result.Repository.Id,
                Title = title,
                Description = description,
                TriggerApi = $"{api.HttpMethod} {api.Route}",
                Steps = steps,
                MermaidMarkup = mermaidBuilder.ToString()
            });
        }

        // Fallback for non-API service flows
        if (flows.Count == 0 && result.Entities.Any(e => e.Type == EntityType.Service))
        {
            var services = result.Entities.Where(e => e.Type == EntityType.Service).Take(5);
            foreach (var service in services)
            {
                var mermaidBuilder = new StringBuilder();
                mermaidBuilder.AppendLine("graph TD");
                mermaidBuilder.AppendLine("    classDef svcStyle fill:#2e1065,stroke:#a855f7,stroke-width:2px,color:#fff,rx:8,ry:8;");
                mermaidBuilder.AppendLine($"    Service[\"⚙️ Service: {service.Name}\"]:::svcStyle");

                flows.Add(new FunctionalFlow
                {
                    Id = Guid.NewGuid().ToString(),
                    RepositoryId = result.Repository.Id,
                    Title = $"{service.Name} Service Workflow",
                    Description = $"Service execution flow for {service.FullName}",
                    TriggerApi = service.Name,
                    Steps = new List<FunctionalFlowStep>
                    {
                        new FunctionalFlowStep
                        {
                            StepNumber = 1,
                            NodeName = service.Name,
                            NodeType = "Service",
                            Description = "Application Service Component",
                            FilePath = service.FilePath,
                            LineNumber = service.StartLine
                        }
                    },
                    MermaidMarkup = mermaidBuilder.ToString()
                });
            }
        }

        return flows;
    }

    private static string SanitizeNodeId(string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "Node";
        return Regex.Replace(text, @"[^A-Za-z0-9_]", "_");
    }
}
