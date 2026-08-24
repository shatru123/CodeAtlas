using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CodeAtlas.Domain.Models;
using CodeAtlas.Infrastructure.Parsers;
using Xunit;

namespace CodeAtlas.Infrastructure.Tests;

public class RoslynParserTests
{
    private readonly CSharpRoslynParser _parser;

    public RoslynParserTests()
    {
        _parser = new CSharpRoslynParser();
    }

    [Fact]
    public void CanParse_ShouldReturnTrueForCSharpFiles()
    {
        Assert.True(_parser.CanParse("OrderService.cs"));
        Assert.False(_parser.CanParse("OrderService.py"));
    }

    [Fact]
    public async Task ParseFileAsync_ShouldExtractClassesMethodsApisAndEvents()
    {
        var sampleCode = @"
namespace Ticketmaster.Booking;

using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

public interface IBookingService
{
    Task<string> CreateBookingAsync(BookingDto request);
}

[ApiController]
[Route(""api/[controller]"")]
public class BookingController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BookingDto dto)
    {
        var id = await _bookingService.CreateBookingAsync(dto);
        return Ok(id);
    }
}

public class BookingDto
{
    public string EventId { get; set; }
    public int Seats { get; set; }
}

public class BookingCreatedEvent
{
    public string BookingId { get; set; }
}

public class BookingConsumer : MassTransit.IConsumer<BookingCreatedEvent>
{
    public async Task Consume(BookingCreatedEvent context)
    {
        await Task.CompletedTask;
    }
}
";

        var entities = new List<CodeEntity>();
        var relationships = new List<CodeRelationship>();
        var apis = new List<ApiDefinition>();
        var dbs = new List<DatabaseReference>();
        var events = new List<EventDefinition>();
        var errors = new List<string>();

        await _parser.ParseFileAsync(
            "repo-1",
            "Ticketmaster/BookingController.cs",
            "/full/path/Ticketmaster/BookingController.cs",
            sampleCode,
            entities,
            relationships,
            apis,
            dbs,
            events,
            errors);

        Assert.Empty(errors);

        // Verify Entities
        Assert.Contains(entities, e => e.Name == "IBookingService" && e.Type == EntityType.Interface);
        Assert.Contains(entities, e => e.Name == "BookingController" && e.Type == EntityType.Controller);
        Assert.Contains(entities, e => e.Name == "BookingDto" && e.Type == EntityType.DTO);
        Assert.Contains(entities, e => e.Name == "BookingConsumer" && e.Type == EntityType.Consumer);

        // Verify API Endpoint Extraction
        Assert.Single(apis);
        var api = apis.First();
        Assert.Equal("/api/Booking", api.Route);
        Assert.Equal("POST", api.HttpMethod);
        Assert.Equal("BookingController", api.ControllerName);
        Assert.Equal("Create", api.ActionName);

        // Verify Dependency Injection Relationship
        Assert.Contains(relationships, r => r.SourceFullName == "Ticketmaster.Booking.BookingController" && r.TargetFullName == "IBookingService" && r.Type == RelationshipType.DependsOn);

        // Verify Event Consumer Extraction
        Assert.Single(events);
        var ev = events.First();
        Assert.Equal("BookingCreatedEvent", ev.EventName);
        Assert.Equal("Consumer", ev.Role);
    }
}
