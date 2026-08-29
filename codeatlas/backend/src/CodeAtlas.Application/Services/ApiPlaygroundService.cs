using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Services;

public class ApiPlaygroundService
{
    private static readonly HttpClient HttpClient = new HttpClient();

    public async Task<ApiPlaygroundResponse> ExecuteApiRequestAsync(ApiPlaygroundRequest request)
    {
        var sw = Stopwatch.StartNew();
        try
        {
            var targetUrl = request.Url;
            if (!targetUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                targetUrl = $"http://localhost:5055{request.Url}";
            }

            var method = new HttpMethod(request.Method.ToUpper());
            using var httpRequest = new HttpRequestMessage(method, targetUrl);

            if (method != HttpMethod.Get && !string.IsNullOrWhiteSpace(request.PayloadJson))
            {
                httpRequest.Content = new StringContent(request.PayloadJson, Encoding.UTF8, "application/json");
            }

            foreach (var h in request.Headers)
            {
                httpRequest.Headers.TryAddWithoutValidation(h.Key, h.Value);
            }

            using var response = await HttpClient.SendAsync(httpRequest);
            sw.Stop();

            var body = await response.Content.ReadAsStringAsync();
            var resHeaders = new Dictionary<string, string>();
            foreach (var h in response.Headers)
            {
                resHeaders[h.Key] = string.Join(", ", h.Value);
            }

            return new ApiPlaygroundResponse
            {
                StatusCode = (int)response.StatusCode,
                StatusText = response.StatusCode.ToString(),
                DurationMs = sw.ElapsedMilliseconds,
                ResponseBodyJson = FormatJsonOrRaw(body),
                ResponseHeaders = resHeaders
            };
        }
        catch (Exception ex)
        {
            sw.Stop();
            return new ApiPlaygroundResponse
            {
                StatusCode = 500,
                StatusText = "Internal Error",
                DurationMs = sw.ElapsedMilliseconds,
                ResponseBodyJson = JsonSerializer.Serialize(new { error = ex.Message }, new JsonSerializerOptions { WriteIndented = true }),
                ResponseHeaders = new Dictionary<string, string>()
            };
        }
    }

    private string FormatJsonOrRaw(string raw)
    {
        try {
            var doc = JsonDocument.Parse(raw);
            return JsonSerializer.Serialize(doc, new JsonSerializerOptions { WriteIndented = true });
        } catch {
            return raw;
        }
    }
}
