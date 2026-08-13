using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Services
{
    public class VisitorTrackerService
    {
        private static readonly HttpClient HttpClient = new HttpClient();
        private readonly string _storageFilePath;
        private readonly List<VisitorLog> _visitorLogs = new List<VisitorLog>();
        private readonly object _lockObj = new object();
        private readonly string _adminPin;

        public VisitorTrackerService()
        {
            _storageFilePath = Path.Combine(Directory.GetCurrentDirectory(), "visitors.json");
            _adminPin = Environment.GetEnvironmentVariable("ADMIN_PIN") ?? "shatru2026";
            LoadLogsFromDisk();
        }

        public async Task<VisitorLog> RecordVisitAsync(string rawIp, string userAgent, string referrer = null, string email = null, double? lat = null, double? lng = null)
        {
            var ip = CleanIpAddress(rawIp);
            var geo = await ResolveGeolocationAsync(ip, lat, lng);

            var deviceType = "Desktop";
            if (!string.IsNullOrEmpty(userAgent))
            {
                var uaLower = userAgent.ToLower();
                if (uaLower.Contains("mobile") || uaLower.Contains("android") || uaLower.Contains("iphone")) deviceType = "Mobile";
                else if (uaLower.Contains("ipad") || uaLower.Contains("tablet")) deviceType = "Tablet";
            }

            VisitorLog log;
            lock (_lockObj)
            {
                var existing = _visitorLogs.FirstOrDefault(v => v.IpAddress == ip);
                if (existing != null)
                {
                    existing.VisitCount++;
                    existing.Timestamp = DateTime.UtcNow;
                    if (!string.IsNullOrEmpty(email)) existing.Email = email;
                    if (!string.IsNullOrEmpty(referrer)) existing.Referrer = referrer;
                    if (lat.HasValue && lng.HasValue)
                    {
                        existing.Latitude = lat;
                        existing.Longitude = lng;
                        existing.ExactLocation = geo.ExactLocation;
                        existing.City = geo.City;
                        existing.Country = geo.Country;
                        existing.CountryCode = geo.CountryCode;
                    }
                    log = existing;
                }
                else
                {
                    log = new VisitorLog
                    {
                        IpAddress = ip,
                        Country = geo.Country,
                        City = geo.City,
                        CountryCode = geo.CountryCode,
                        ExactLocation = geo.ExactLocation,
                        Latitude = lat,
                        Longitude = lng,
                        Isp = geo.Isp,
                        UserAgent = userAgent ?? string.Empty,
                        DeviceType = deviceType,
                        Referrer = referrer ?? string.Empty,
                        Email = email ?? string.Empty,
                        Timestamp = DateTime.UtcNow,
                        VisitCount = 1,
                        IsUnique = true
                    };
                    _visitorLogs.Add(log);
                }

                SaveLogsToDisk();
            }

            return log;
        }

        public object GetDashboardSummary(string pin)
        {
            if (string.IsNullOrWhiteSpace(pin) || pin.Trim() != _adminPin)
            {
                throw new UnauthorizedAccessException("Invalid Admin Secret PIN.");
            }

            lock (_lockObj)
            {
                var totalPageviews = _visitorLogs.Sum(v => v.VisitCount);
                var uniqueVisitors = _visitorLogs.Count;
                var countriesCount = _visitorLogs.Select(v => v.Country).Distinct().Count();

                var countryStats = _visitorLogs
                    .GroupBy(v => new { v.Country, v.CountryCode })
                    .Select(g => new
                    {
                        Country = g.Key.Country,
                        CountryCode = g.Key.CountryCode,
                        UniqueVisitors = g.Count(),
                        TotalPageviews = g.Sum(x => x.VisitCount)
                    })
                    .OrderByDescending(x => x.UniqueVisitors)
                    .ToList();

                var recentLogs = _visitorLogs
                    .OrderByDescending(v => v.Timestamp)
                    .Take(100)
                    .ToList();

                return new
                {
                    TotalPageviews = totalPageviews,
                    UniqueVisitors = uniqueVisitors,
                    CountriesCount = countriesCount,
                    CountryBreakdown = countryStats,
                    Logs = recentLogs
                };
            }
        }

        private string CleanIpAddress(string rawIp)
        {
            if (string.IsNullOrWhiteSpace(rawIp)) return "127.0.0.1";

            // If X-Forwarded-For contains multiple IPs, take the first one
            var firstIp = rawIp.Split(',')[0].Trim();
            if (firstIp == "::1" || firstIp == "127.0.0.1" || firstIp.StartsWith("localhost"))
            {
                return "127.0.0.1";
            }
            return firstIp;
        }

        private async Task<(string Country, string City, string CountryCode, string Isp, string ExactLocation)> ResolveGeolocationAsync(string ip, double? lat = null, double? lng = null)
        {
            string exactLoc = "Unknown";
            string country = "Unknown";
            string city = "Unknown";
            string countryCode = "UN";
            string isp = "Unknown Provider";

            if (lat.HasValue && lng.HasValue)
            {
                try
                {
                    var reverseGeoUrl = $"https://api.bigdatacloud.net/data/reverse-geocode-client?latitude={lat.Value}&longitude={lng.Value}&localityLanguage=en";
                    var geoRes = await HttpClient.GetStringAsync(reverseGeoUrl);
                    using var geoDoc = JsonDocument.Parse(geoRes);
                    var geoRoot = geoDoc.RootElement;

                    var locality = geoRoot.TryGetProperty("locality", out var loc) ? loc.GetString() : "";
                    var cty = geoRoot.TryGetProperty("city", out var ct) && !string.IsNullOrWhiteSpace(ct.GetString())
                        ? ct.GetString()
                        : locality;

                    city = !string.IsNullOrWhiteSpace(cty) ? cty : "Unknown";
                    var state = geoRoot.TryGetProperty("principalSubdivision", out var st) ? st.GetString() : "";
                    country = geoRoot.TryGetProperty("countryName", out var cn) ? cn.GetString() : "Unknown";
                    countryCode = geoRoot.TryGetProperty("countryCode", out var cc) ? cc.GetString() : "UN";

                    exactLoc = string.IsNullOrWhiteSpace(locality)
                        ? $"{city}, {state}, {country}".Trim(',', ' ')
                        : $"{locality}, {city}, {state}, {country}".Trim(',', ' ');
                }
                catch
                {
                    // Fallback to IP geo if reverse geocoding fails
                }
            }

            if (ip == "127.0.0.1" || ip == "localhost")
            {
                if (country == "Unknown") country = "India";
                if (city == "Unknown") city = "Pune";
                if (countryCode == "UN") countryCode = "IN";
                isp = "Local Host Loopback";
                if (exactLoc == "Unknown") exactLoc = $"{city}, Maharashtra, {country}";
                return (country, city, countryCode, isp, exactLoc);
            }

            try
            {
                var url = $"http://ip-api.com/json/{ip}?fields=status,country,countryCode,city,isp";
                var response = await HttpClient.GetStringAsync(url);
                using var doc = JsonDocument.Parse(response);
                var root = doc.RootElement;

                if (root.TryGetProperty("status", out var status) && status.GetString() == "success")
                {
                    if (country == "Unknown") country = root.TryGetProperty("country", out var c) ? c.GetString() ?? "Unknown" : "Unknown";
                    if (city == "Unknown") city = root.TryGetProperty("city", out var ct2) ? ct2.GetString() ?? "Unknown" : "Unknown";
                    if (countryCode == "UN") countryCode = root.TryGetProperty("countryCode", out var cc2) ? cc2.GetString() ?? "UN" : "UN";
                    isp = root.TryGetProperty("isp", out var i) ? i.GetString() ?? "Unknown" : "Unknown Provider";
                    if (exactLoc == "Unknown") exactLoc = $"{city}, {country}";
                }
            }
            catch
            {
                // Fallback on geo API error
            }

            return (country, city, countryCode, isp, exactLoc);
        }

        private void LoadLogsFromDisk()
        {
            try
            {
                if (File.Exists(_storageFilePath))
                {
                    var json = File.ReadAllText(_storageFilePath);
                    var logs = JsonSerializer.Deserialize<List<VisitorLog>>(json);
                    if (logs != null)
                    {
                        _visitorLogs.AddRange(logs);
                    }
                }
            }
            catch
            {
                // Ignore load errors
            }
        }

        private void SaveLogsToDisk()
        {
            try
            {
                var json = JsonSerializer.Serialize(_visitorLogs, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(_storageFilePath, json);
            }
            catch
            {
                // Ignore save errors
            }
        }
    }
}
