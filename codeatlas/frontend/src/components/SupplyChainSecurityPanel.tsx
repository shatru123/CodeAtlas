import React, { useState, useEffect } from 'react';
import { Package, ShieldAlert, CheckCircle, RefreshCw, FileText, ExternalLink, Sparkles } from 'lucide-react';
import { apiService } from '../services/apiService';
import { MetricTooltip } from './MetricTooltip';
import { ContextualHelpBox } from './ContextualHelpBox';

interface SupplyChainSecurityPanelProps {
  repoId: string;
}

export const SupplyChainSecurityPanel: React.FC<SupplyChainSecurityPanelProps> = ({ repoId }) => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAudit();
  }, [repoId]);

  const fetchAudit = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getSupplyChainSecurityAudit(repoId);
      setItems(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-rose)' }} />
        <div>Auditing Dependency Package Trees & License Compliance...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <ContextualHelpBox
        title="What is Supply Chain Security & License Auditing?"
        description="Supply Chain Security inspects all direct and transitive NuGet / npm package dependencies for known CVE security vulnerabilities and verifies open-source license compliance (MIT vs Apache vs copyleft GPL-3.0)."
      />

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(159, 18, 57, 0.5))', border: '1.5px solid var(--accent-rose)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(244,63,94,0.4)' }}>
              <Package size={24} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>
                Supply Chain Security & License Matrix (<MetricTooltip term="CVE & License Audit" explanation="Audits third-party NuGet/npm libraries for security vulnerabilities and copyleft legal compliance." />)
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Audited {items.length} third-party package dependencies for CVE security risks and license compliance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dependencies Table */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {items.map((pkg, idx) => (
          <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Package size={18} color="var(--accent-rose)" />
                <strong style={{ fontSize: '1rem', color: 'white' }}>{pkg.packageName}</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>v{pkg.installedVersion} → v{pkg.recommendedVersion}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ background: 'rgba(244,63,94,0.2)', color: 'var(--accent-rose)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>
                  {pkg.cveId}
                </span>
                <span style={{ background: pkg.isLicenseCompliant ? 'rgba(74,222,128,0.2)' : 'rgba(245,158,11,0.2)', color: pkg.isLicenseCompliant ? 'var(--accent-emerald)' : 'var(--accent-amber)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '800' }}>
                  License: {pkg.licenseType}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{pkg.summary}</div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-card)', paddingTop: '0.65rem', marginTop: '0.2rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: '700' }}>
                ⚡ Recommended Action: {pkg.action}
              </div>
              <button className="btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                <Sparkles size={13} /> Upgrade Package via Agent
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
