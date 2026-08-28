// Master Data Model for Shatrughna Ambhore's Resume
const initialResumeData = {
  personalInfo: {
    fullName: "Shatrughna Ambhore",
    title: "Senior Backend / Software Engineer | .NET | Microservices | Observability | AI",
    email: "ambhoreshatrughna@gmail.com",
    phone: "+91 9604466334",
    location: "Pune, Maharashtra, India (Remote)",
    github: "github.com/shatru123",
    linkedin: "linkedin.com/in/shatrughna-ambhore",
    targetRoles: "Senior Backend Engineer, Senior Software Engineer, .NET Lead, Platform Engineer",
    noticePeriod: "60 Days",
    workPreference: "Remote / Remote-first",
    summary: "Senior Software Engineer with 8+ years of experience designing, modernizing, and operating high-throughput enterprise backend systems using C#, .NET 8/10, ASP.NET Core, and microservices. Proven track record at Ticketmaster architecting high-scale services across Event Discovery, Availability, and Catalogue. Specialized in OpenTelemetry observability, k6/Gatling performance engineering for peak-traffic onsales, and building cutting-edge AI-assisted operational tooling using Claude, Kibana MCP, and Slack MCP to automate log diagnostics."
  },
  skills: [
    { category: "Backend & Core", items: ["C#", ".NET 6/8/10", "ASP.NET Core", "Web API", "Minimal APIs", "Entity Framework Core", "LINQ", "MediatR"] },
    { category: "Architecture", items: ["Microservices", "Distributed Systems", "REST APIs", "Clean Architecture", "CQRS", "Resiliency Patterns", "API Evolution", "Feature Flags"] },
    { category: "Observability", items: ["OpenTelemetry", "Prometheus", "Grafana", "Splunk", "Kibana", "Elasticsearch", "Serilog", "Distributed Tracing", "Health Checks"] },
    { category: "Performance & Quality", items: ["k6", "Gatling/Scala", "p95 Latency Optimization", "RPS Analysis", "CPU/Resource Profiling", "xUnit", "NUnit", "Moq", "Swagger/OpenAPI"] },
    { category: "AI & Modern Tooling", items: ["Claude / Anthropic API", "OpenAI API", "Ollama", "Model Context Protocol (MCP)", "LLM Abstraction Layers", "AI Operational Tooling"] },
    { category: "Cloud, DevOps & Messaging", items: ["AWS", "AWS Lambda", "Docker", "Terraform", "GitLab CI/CD", "RabbitMQ", "NServiceBus", "HashiCorp Vault", "Consul", "Fastly", "SQL Server", "PostgreSQL", "Couchbase"] }
  ],
  experience: [
    {
      id: "exp-1",
      company: "TICKETMASTER",
      role: "Senior Engineer 1",
      location: "Pune, India (Remote)",
      startDate: "Jun 2023",
      endDate: "Present",
      domains: "Event Discovery, Catalogue, Availability, Customer, TMPro, Virtual Venue",
      highlights: [
        "Architected and modernized core backend microservices across Event Discovery, Availability, and Catalogue domains, maintaining 99.99% service reliability during high-concurrency ticket onsales.",
        "Spearheaded .NET enterprise modernization initiatives, upgrading services seamlessly from .NET 6 to .NET 8 and preparing .NET 10 upgrade pipelines while eliminating legacy technical debt.",
        "Designed and implemented end-to-end OpenTelemetry instrumentation (metrics, logs, distributed tracing, database tracing) across Availability, Catalogue, Identity Server, and Verification APIs, replacing legacy telemetry.",
        "Built custom operational Grafana dashboards monitoring CPU load, request rates, error spikes, and p95 latencies, significantly reducing Incident MTTR.",
        "Engineered automated Slack alerting mechanisms for rate-limits and error thresholds, proactively catching 95%+ of API anomalies before customer impact.",
        "Pioneered an AI-powered log-monitoring platform integrating Claude API, Kibana MCP, and Slack MCP to run automated 2-minute diagnostic cycles during high-traffic onsales, eliminating manual log analysis.",
        "Provisioned production-like performance testing environments using Terraform, executing k6 and Gatling/Scala benchmarks for high-volume scenarios involving 1M+ Price Bands.",
        "Engineered performance validation pipelines for Virtual Venue (3D venue map engine), identifying memory/CPU bottlenecks and optimizing p95 latency under peak loads.",
        "Managed Catalogue API contract evolution (V2 API endpoints) using feature-toggle rollouts and consumer payload analysis to ensure zero-downtime migration."
      ]
    },
    {
      id: "exp-2",
      company: "PUBLICIS SAPIENT",
      role: "Software Developer",
      location: "Pune, India",
      startDate: "May 2022",
      endDate: "Jun 2023",
      domains: "Enterprise E-Commerce & Retail Backend",
      highlights: [
        "Led legacy backend modernization from legacy .NET Framework 4.6 to .NET 6 microservices, reducing API response times by 35% and improving server resource utilization.",
        "Architected asynchronous messaging workflows using RabbitMQ and NServiceBus for distributed event processing across order fulfillment pipelines.",
        "Implemented and maintained high-performance Elasticsearch clusters and indexing jobs, speeding up product catalog search query speeds.",
        "Optimized EF Core queries and SQL Server stored procedures, eliminating database locks during peak promotional traffic."
      ]
    },
    {
      id: "exp-3",
      company: "NLB SERVICES PVT. LTD.",
      role: "Dotnet Developer",
      location: "Pune, India",
      startDate: "May 2021",
      endDate: "May 2022",
      domains: "Enterprise Financial Services",
      highlights: [
        "Designed and developed scalable RESTful APIs using ASP.NET Core and Entity Framework, delivering robust client backend solutions.",
        "Collaborated closely with QA and DevOps teams to establish automated CI/CD deployment pipelines, accelerating release cycles."
      ]
    },
    {
      id: "exp-4",
      company: "IOLABTECH TECHNOVATION & GCAPTOR IT",
      role: "Software Engineer",
      location: "Pune, India",
      startDate: "Prior 2021",
      endDate: "May 2021",
      domains: "Custom Software Solutions",
      highlights: [
        "Developed and maintained full-lifecycle enterprise C# / .NET web applications and SQL database systems.",
        "Participated in debugging, code reviews, unit testing, and production application support."
      ]
    }
  ],
  projects: [
    {
      id: "proj-1",
      name: "ClaudeAI.DotNet",
      tech: "C#, .NET 8, Anthropic API, OpenAI API, Ollama, MCP",
      description: "Provider-agnostic .NET SDK and abstractions for integrating multiple LLM providers (Claude, GPT-4, Ollama). Eliminates vendor lock-in with clean interfaces and standardized streaming responses."
    },
    {
      id: "proj-2",
      name: "AI Onsale Log Diagnostics Agent",
      tech: "Claude API, Kibana MCP, Slack MCP, ASP.NET Core, Worker Services",
      description: "Autonomous log monitoring bot built for Ticketmaster onsales. Polls Kibana via MCP every 2 minutes, analyzes stack traces with Claude, and posts actionable diagnostic alerts directly to engineering Slack channels."
    }
  ],
  education: [
    {
      degree: "Bachelor of Engineering (B.E.) — Computer Engineering",
      institution: "Sinhgad Institute, Pune University",
      year: "Completed"
    },
    {
      degree: "Diploma in Information Technology",
      institution: "Government Polytechnic, Maharashtra",
      year: "Completed"
    }
  ]
};
