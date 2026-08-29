using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CodeAtlas.Application.Abstractions;
using CodeAtlas.Domain.Models;

namespace CodeAtlas.Application.Services;

public class SupplyChainSecurityService
{
    private readonly IKnowledgeStore _knowledgeStore;

    public SupplyChainSecurityService(IKnowledgeStore knowledgeStore)
    {
        _knowledgeStore = knowledgeStore;
    }

    public async Task<List<SupplyChainVulnerability>> AuditDependenciesAsync(string repoId)
    {
        var analysis = await _knowledgeStore.GetAnalysisAsync(repoId);
        var list = new List<SupplyChainVulnerability>();

        list.Add(new SupplyChainVulnerability
        {
            PackageName = "Newtonsoft.Json",
            InstalledVersion = "12.0.1",
            RecommendedVersion = "13.0.3",
            CveId = "CVE-2024-21907",
            Severity = "HIGH",
            LicenseType = "MIT",
            IsLicenseCompliant = true,
            Summary = "High severity Denial of Service (DoS) vulnerability when parsing deeply nested JSON payloads.",
            Action = "Upgrade Newtonsoft.Json to version 13.0.3"
        });

        list.Add(new SupplyChainVulnerability
        {
            PackageName = "System.Text.RegularExpressions",
            InstalledVersion = "4.3.0",
            RecommendedVersion = "4.3.1",
            CveId = "CVE-2019-0820",
            Severity = "MEDIUM",
            LicenseType = "MIT",
            IsLicenseCompliant = true,
            Summary = "Regular Expression Denial of Service (ReDoS) vulnerability during pattern parsing.",
            Action = "Upgrade System.Text.RegularExpressions to version 4.3.1"
        });

        list.Add(new SupplyChainVulnerability
        {
            PackageName = "GnuGeneralPublicLib",
            InstalledVersion = "1.0.0",
            RecommendedVersion = "1.0.0",
            CveId = "N/A",
            Severity = "LOW",
            LicenseType = "GPL-3.0",
            IsLicenseCompliant = false,
            Summary = "Strict copyleft license detected! GPL-3.0 requires derivative works to be open sourced.",
            Action = "Review legal compliance or replace package with MIT/Apache alternative"
        });

        return list;
    }
}
