import React, { useState } from 'react';
import { SecurityAuditResult, SeverityLevel } from '../types/api';
import { ShieldAlert, KeyRound, AlertOctagon, CheckCircle2, Shield, Lock, FileCode } from 'lucide-react';

interface SecurityExplorerProps {
  audit: SecurityAuditResult | undefined;
}

export const SecurityExplorer: React.FC<SecurityExplorerProps> = ({ audit }) => {
  const [activeTab, setActiveTab] = useState<'cve' | 'secrets' | 'owasp'>('cve');

  if (!audit) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Shield size={42} color="var(--accent-cyan)" style={{ marginBottom: '1rem' }} />
        <h3>No Security Audit Data Available</h3>
        <p>Scan a repository to run automatic CVE, secret leak, and OWASP API security checks.</p>
      </div>
    );
  }

  const { securityScore, vulnerabilities, secretLeaks, owaspViolations } = audit;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'var(--accent-emerald)';
    if (score >= 70) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case SeverityLevel.Critical:
        return <span style={{ background: 'rgba(244, 63, 94, 0.25)', color: 'var(--accent-rose)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>CRITICAL</span>;
      case SeverityLevel.High:
        return <span style={{ background: 'rgba(245, 158, 11, 0.25)', color: 'var(--accent-amber)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>HIGH</span>;
      case SeverityLevel.Medium:
        return <span style={{ background: 'rgba(56, 189, 248, 0.25)', color: 'var(--accent-cyan)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>MEDIUM</span>;
      default:
        return <span style={{ background: 'rgba(16, 185, 129, 0.25)', color: 'var(--accent-emerald)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>LOW</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
      {/* Security Overview Header */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(99, 102, 241, 0.12))', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <ShieldAlert size={24} color={getScoreColor(securityScore)} style={{ flexShrink: 0 }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'white' }}>Security, Secret & CVE Audit</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Automatic CVE vulnerability scanner, hardcoded secret leak detector, and OWASP API security auditor.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: `1px solid ${getScoreColor(securityScore)}`, textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: getScoreColor(securityScore) }}>{securityScore}/100</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Security Health Score</div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.6rem 1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: vulnerabilities.length > 0 ? 'var(--accent-rose)' : 'white' }}>{vulnerabilities.length}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CVE Alerts</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.6rem 1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: secretLeaks.length > 0 ? 'var(--accent-amber)' : 'white' }}>{secretLeaks.length}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Secret Leaks</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.6rem 1rem', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-card)' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: owaspViolations.length > 0 ? 'var(--accent-purple)' : 'white' }}>{owaspViolations.length}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>OWASP API Rules</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtabs */}
      <div style={{ display: 'flex', gap: '0.6rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('cve')}
          style={{
            background: activeTab === 'cve' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
            color: activeTab === 'cve' ? 'white' : 'var(--text-muted)',
            border: activeTab === 'cve' ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid transparent',
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <AlertOctagon size={16} color="var(--accent-rose)" />
          Package CVE Vulnerabilities ({vulnerabilities.length})
        </button>

        <button
          onClick={() => setActiveTab('secrets')}
          style={{
            background: activeTab === 'secrets' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
            color: activeTab === 'secrets' ? 'white' : 'var(--text-muted)',
            border: activeTab === 'secrets' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <KeyRound size={16} color="var(--accent-amber)" />
          Hardcoded Secret Leaks ({secretLeaks.length})
        </button>

        <button
          onClick={() => setActiveTab('owasp')}
          style={{
            background: activeTab === 'owasp' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
            color: activeTab === 'owasp' ? 'white' : 'var(--text-muted)',
            border: activeTab === 'owasp' ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid transparent',
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Lock size={16} color="var(--accent-purple)" />
          OWASP API Security Rules ({owaspViolations.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'cve' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
          {vulnerabilities.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--accent-emerald)' }}>
              <CheckCircle2 size={32} style={{ marginBottom: '0.5rem' }} />
              <h4>Zero Package CVE Vulnerabilities Found</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>All NuGet, NPM, and PyPI dependencies pass vulnerability checks.</p>
            </div>
          ) : (
            vulnerabilities.map((v) => (
              <div key={v.id} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid rgba(244, 63, 94, 0.3)', background: 'rgba(244, 63, 94, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white' }}>{v.packageName} ({v.version})</span>
                  {getSeverityBadge(v.severity)}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-rose)', fontWeight: '700' }}>{v.cveId}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{v.summary}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '600', marginTop: '0.2rem' }}>💡 {v.recommendation}</div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'secrets' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
          {secretLeaks.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--accent-emerald)' }}>
              <CheckCircle2 size={32} style={{ marginBottom: '0.5rem' }} />
              <h4>Zero Hardcoded Secret Leaks Detected</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No AWS keys, JWT secrets, or DB passwords found in source files.</p>
            </div>
          ) : (
            secretLeaks.map((s) => (
              <div key={s.id} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white' }}>{s.secretType}</span>
                  {getSeverityBadge(s.severity)}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-code)', fontWeight: '700' }}>
                  Masked Secret: {s.maskedValue}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)' }}>
                  <FileCode size={14} />
                  <span>{s.filePath}:{s.lineNumber}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'owasp' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
          {owaspViolations.length === 0 ? (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--accent-emerald)' }}>
              <CheckCircle2 size={32} style={{ marginBottom: '0.5rem' }} />
              <h4>OWASP API Security Rules Verified</h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Zero unauthenticated or insecure API endpoints detected.</p>
            </div>
          ) : (
            owaspViolations.map((o) => (
              <div key={o.id} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid rgba(168, 85, 247, 0.3)', background: 'rgba(168, 85, 247, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white' }}>{o.httpMethod} {o.route}</span>
                  <span style={{ background: 'rgba(168, 85, 247, 0.25)', color: 'var(--accent-purple)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>{o.ruleId}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{o.description}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)' }}>
                  <FileCode size={14} />
                  <span>{o.filePath}:{o.lineNumber}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
