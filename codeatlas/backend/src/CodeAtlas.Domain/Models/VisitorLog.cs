using System;

namespace CodeAtlas.Domain.Models
{
    public class VisitorLog
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string IpAddress { get; set; } = string.Empty;
        public string Country { get; set; } = "Unknown";
        public string City { get; set; } = "Unknown";
        public string CountryCode { get; set; } = "UN";
        public string Isp { get; set; } = "Unknown";
        public string UserAgent { get; set; } = string.Empty;
        public string DeviceType { get; set; } = "Desktop";
        public string Referrer { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public int VisitCount { get; set; } = 1;
        public bool IsUnique { get; set; } = true;
    }
}
