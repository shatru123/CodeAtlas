import React, { useState, useEffect } from 'react';
import { Stethoscope, ShieldAlert, Sparkles, RefreshCw, Code, CheckCircle, AlertTriangle, ArrowRight, GitCommit, FileText } from 'lucide-react';
import { apiService } from '../services/apiService';

interface TechDebtDoctorPanelProps {
  repoId: string;
}

export const TechDebtDoctorPanel: React.FC<TechDebtDoctorPanelProps> = ({ repoId }) => {
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDiff, setActiveDiff] = useState<{ entity: string; diff: string } | null>(null);
  const [generatingEntity, setGeneratingEntity] = useState<string | null>(null);

  useEffect(() => {
    fetchDiagnosis();
  }, [repoId]);

  const fetchDiagnosis = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getDoctorDiagnosis(repoId);
      setDiagnosis(data);
    } catch {
      // Fallback UI data
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRefactor = async (entityName: string) => {
    setGeneratingEntity(entityName);
    try {
      const apiKey = localStorage.getItem('codeatlas_gemini_api_key') || undefined;
      const res = await apiService.generateDoctorRefactor(repoId, entityName, apiKey);
      setActiveDiff({ entity: entityName, diff: res.diff });
    } catch {
      // Fallback
    } finally {
      setGeneratingEntity(null);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-cyan)' }} />
        <div>Running AI Tech Debt & Code Smells Doctor Audit...</div>
      </div>
    );
  }

  const score = diagnosis?.healthScore ?? 85;
  const scoreColor = score > 80 ? 'var(--accent-emerald)' : score > 60 ? 'var(--accent-amber)' : 'var(--accent-rose)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.9), rgba(30, 27, 75, 0.5))', border: '1.5px solid var(--accent-indigo)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }}>
              <Stethoscope size={26} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>CodeAtlas AI Tech Debt Doctor</h2>
                <span style={{ background: 'rgba(99, 102, 241, 0.18)', color: 'var(--accent-indigo)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                  AI Refactoring Bot Active
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Detects God classes, cyclomatic complexity, circular dependencies, dead code, and generates AI refactoring diffs.
              </p>
            </div>
          </div>

          <button onClick={fetchDiagnosis} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <RefreshCw size={15} /> Re-Audit Codebase
          </button>
        </div>
      </div>

      {/* Summary Score Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: `4px solid ${scoreColor}` }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Solution Health Score</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: scoreColor, marginTop: '0.2rem' }}>{score}/100</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Based on AST complexity & rules</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-rose)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Code Smells Detected</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', marginTop: '0.2rem' }}>{diagnosis?.codeSmells?.length ?? 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>God classes & high complexity</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-amber)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Circular Dependency Cycles</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', marginTop: '0.2rem' }}>{diagnosis?.circularDependencies?.length ?? 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Bidirectional tight coupling</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-cyan)' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Dead Code Unreferenced</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'white', marginTop: '0.2rem' }}>{diagnosis?.deadCodeItems?.length ?? 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>0 caller references in AST</div>
        </div>
      </div>

      {/* Code Smells List & AI Refactor Diff Generator */}
      <div style={{ display: 'grid', gridTemplateColumns: activeDiff ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} color="var(--accent-amber)" /> Code Smells & Refactoring Candidates ({diagnosis?.codeSmells?.length ?? 0})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {diagnosis?.codeSmells?.map((smell: any, idx: number) => (
              <div key={idx} style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} color="var(--accent-cyan)" />
                    <span style={{ fontWeight: '800', color: 'white', fontSize: '0.95rem' }}>{smell.entityName}</span>
                    <span style={{ background: smell.severity === 'High' ? 'rgba(244, 63, 94, 0.18)' : 'rgba(245, 158, 11, 0.18)', color: smell.severity === 'High' ? 'var(--accent-rose)' : 'var(--accent-amber)', padding: '0.1rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '800' }}>
                      {smell.smellType}
                    </span>
                  </div>

                  <button
                    onClick={() => handleGenerateRefactor(smell.entityName)}
                    disabled={generatingEntity === smell.entityName}
                    className="btn-primary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                  >
                    {generatingEntity === smell.entityName ? <RefreshCw size={13} className="spin" /> : <Sparkles size={13} />}
                    <span>AI Refactor Diff</span>
                  </button>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>{smell.description}</p>
                <div style={{ fontSize: '0.73rem', color: 'var(--accent-indigo)', fontFamily: 'var(--font-code)' }}>📄 {smell.filePath} ({smell.lineCount} lines)</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Refactor Code Diff Panel */}
        {activeDiff && (
          <div className="glass-panel" style={{ padding: '1.25rem', border: '1.5px solid var(--accent-cyan)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code size={18} color="var(--accent-cyan)" /> Gemini AI Refactored Code Diff: {activeDiff.entity}
              </h3>

              <button onClick={() => setActiveDiff(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '700' }}>✕ Close</button>
            </div>

            <pre style={{ background: '#0a0d14', color: '#e2e8f0', padding: '1rem', borderRadius: '10px', fontSize: '0.8rem', fontFamily: 'var(--font-code)', overflowX: 'auto', maxHeight: '420px', border: '1px solid var(--border-card)' }}>
              {activeDiff.diff}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
