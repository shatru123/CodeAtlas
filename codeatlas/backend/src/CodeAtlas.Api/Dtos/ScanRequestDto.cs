namespace CodeAtlas.Api.Dtos;

public class ScanRequestDto
{
    public string Path { get; set; } = string.Empty;
    public string? Url { get; set; }
    public string? Branch { get; set; }
    public string? Commit { get; set; }
    public string? AccessToken { get; set; }
}

public class LocalScanRequestDto
{
    public string Path { get; set; } = string.Empty;
}

public class GitHubScanRequestDto
{
    public string Url { get; set; } = string.Empty;
    public string? Branch { get; set; }
    public string? Commit { get; set; }
    public string? AccessToken { get; set; }
}
