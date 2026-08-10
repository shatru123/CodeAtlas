using System;

namespace RepoMind.Domain.Models;

public class EventDefinition
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string RepositoryId { get; set; } = string.Empty;
    public string EventName { get; set; } = string.Empty;
    public string MessageType { get; set; } = string.Empty;
    public string Role { get; set; } = "Publisher"; // Publisher, Consumer
    public string Broker { get; set; } = "MassTransit"; // RabbitMQ, MassTransit, Kafka
    public string HandlerName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public int LineNumber { get; set; }
}
