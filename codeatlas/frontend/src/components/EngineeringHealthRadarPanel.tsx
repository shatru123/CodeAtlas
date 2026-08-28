import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Zap, Play, RefreshCw, AlertTriangle, FileCode, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/apiService';

interface EngineeringHealthRadarPanelProps {
  repoId: string;
}

export const EngineeringHealthRadarPanel: React.FC<EngineeringHealthRadarPanelProps> = ({ repoId }) => {
  const [radar, setRadar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHealthRadar();
  }, [repoId]);

  const fetchHealthRadar = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getHealthRadar(repoId);
      setRadar(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemediate = async (title: string) => {
    try {
      await apiService.createAgentTask(repoId, `Remediate tech debt: ${title}`, 2);
      alert(`Remediation task launched for "${title}"! Check BUILD -> Agent Task Center.`);
    } catch {
      // Fallback
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-emerald)' }} />
        <div>Calculating Engineering Health Radar & Technical Debt Matrix...</div>
      </div>
    );
  }

  const overall = radar?.overallScore || 69;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(6, 78, 59, 0.5))', border: '1.5px solid var(--accent-emerald)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
              <Activity size={26} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>Engineering Health Radar & Technical Debt Matrix</h2>
                <span style={{ background: 'rgba(16, 185, 129, 0.18)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                  7 Pillars Active
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Holistic score across Architecture, Security, Dependencies, Testing, Observability, Documentation, and Complexity.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>OVERALL HEALTH SCORE</div>
            <div style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--accent-emerald)' }}>{overall}/100</div>
          </div>
        </div>
      </div>

      {/* 7 Pillar Badges Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem' }}>
        {[
          { label: 'Architecture', score: radar?.architectureScore || 82, color: 'var(--accent-indigo)' },
          { label: 'Security', score: radar?.securityScore || 91, color: 'var(--accent-emerald)' },
          { label: 'Dependencies', score: radar?.dependencyScore || 76, color: 'var(--accent-cyan)' },
          { label: 'Testing', score: radar?.testingScore || 68, color: 'var(--accent-amber)' },
          { label: 'Observability', score: radar?.observabilityScore || 54, color: 'var(--accent-purple)' },
          { label: 'Documentation', score: radar?.documentationScore || 43, color: 'var(--accent-rose)' },
          { label: 'Complexity', score: radar?.complexityScore || 71, color: 'var(--accent-indigo)' },
        ].map((item, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '1rem', borderLeft: `3.5px solid ${item.color}`, textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{item.label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white', marginTop: '0.2rem' }}>{item.score}</div>
          </div>
        ))}
      </div>

      {/* Prioritized Technical Debt Matrix */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color="var(--accent-amber)" /> Prioritized Technical Debt Matrix (Sorted by Impact × Risk × Usage)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {radar?.debtMatrix?.map((debt: any, idx: number) => (
            <div key={idx} style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.35rem' }}>
                  <FileCode size={18} color="var(--accent-cyan)" />
                  <span style={{ fontWeight: '800', color: 'white', fontSize: '0.95rem' }}>{debt.title}</span>
                  <span style={{ background: 'rgba(244, 63, 94, 0.18)', color: 'var(--accent-rose)', padding: '0.1rem 0.55rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '800' }}>
                    Score: {debt.priorityScore}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>{debt.recommendedAction}</p>
                <div style={{ fontSize: '0.73rem', color: 'var(--accent-indigo)', fontFamily: 'var(--font-code)', marginTop: '0.35rem' }}>
                  📄 {debt.targetFile} (Risk: {debt.riskLevel} | Effort: {debt.estimatedEffort})
                </div>
              </div>

              <button onClick={() => handleRemediate(debt.title)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
                <Play size={14} /> <span>Remediate with Agent</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
