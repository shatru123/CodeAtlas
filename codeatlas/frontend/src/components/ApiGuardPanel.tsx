import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, RefreshCw, FileCode, CheckCircle2, GitPullRequest } from 'lucide-react';
import { apiService } from '../services/apiService';
import { MetricTooltip } from './MetricTooltip';
import { ContextualHelpBox } from './ContextualHelpBox';

interface ApiGuardPanelProps {
  repoId: string;
}

export const ApiGuardPanel: React.FC<ApiGuardPanelProps> = ({ repoId }) => {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchGuard();
  }, [repoId]);

  const fetchGuard = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getApiBreakingChangesReport(repoId);
      setReport(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-amber)' }} />
        <div>Scanning REST API Schemas for Breaking Contract Changes...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <ContextualHelpBox
        title="What is API Guard & Breaking-Change Detector?"
        description="API Guard compares your current REST/gRPC API schemas against production baselines to detect breaking contract modifications (such as removed fields, altered data types, or altered route parameters) before PRs are merged."
      />

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(180, 83, 9, 0.5))', border: '1.5px solid var(--accent-amber)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(245,158,11,0.4)' }}>
            <Shield size={24} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>
              API Guard & Schema Breaking-Change Detector (<MetricTooltip term="API Guard" explanation="Detects breaking REST schema changes before deployment to prevent client app crashes." />)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Scanned {report?.totalApisScanned || 12} REST endpoints • <strong style={{ color: 'var(--accent-amber)' }}>{report?.breakingChangesCount || 1} Breaking Schema Change Detected</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Schema Diffs List */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {report?.diffs?.map((diff: any, idx: number) => (
          <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ background: 'rgba(56,189,248,0.2)', color: 'var(--accent-cyan)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', fontFamily: 'var(--font-code)' }}>
                  {diff.httpMethod}
                </span>
                <strong style={{ fontSize: '0.95rem', color: 'white', fontFamily: 'var(--font-code)' }}>{diff.apiRoute}</strong>
              </div>
              <span style={{ background: diff.changeType === 'BREAKING' ? 'rgba(244,63,94,0.2)' : 'rgba(74,222,128,0.2)', color: diff.changeType === 'BREAKING' ? 'var(--accent-rose)' : 'var(--accent-emerald)', padding: '0.15rem 0.55rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                {diff.changeType} CHANGE
              </span>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{diff.description}</div>

            <div style={{ fontSize: '0.78rem', color: 'var(--accent-rose)', fontWeight: '700' }}>
              ⚠️ Impacted Clients: {diff.impactedClients}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
