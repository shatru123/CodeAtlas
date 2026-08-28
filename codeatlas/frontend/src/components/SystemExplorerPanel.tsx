import React, { useState } from 'react';
import { Compass, Search, Sparkles, ArrowRight, ShieldAlert, Code, CheckCircle, FileText, ExternalLink, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';

interface SystemExplorerPanelProps {
  repoId: string;
}

export const SystemExplorerPanel: React.FC<SystemExplorerPanelProps> = ({ repoId }) => {
  const [query, setQuery] = useState('How does payment processing work and what breaks if I change PaymentService?');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUnderstand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const data = await apiService.understandSystem(repoId, query);
      setResult(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(30, 27, 75, 0.6))', border: '1.5px solid var(--accent-indigo)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #38bdf8)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)' }}>
            <Compass size={26} color="white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>Universal System Explorer</h2>
              <span style={{ background: 'rgba(56, 189, 248, 0.18)', color: 'var(--accent-cyan)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                AI Context Engine
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Ask any architectural, flow, or impact question across source code, AST, APIs, databases, events, and telemetry.
            </p>
          </div>
        </div>

        {/* Natural Language Query Bar */}
        <form onSubmit={handleUnderstand} style={{ display: 'flex', gap: '0.65rem' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'rgba(0,0,0,0.45)', border: '1px solid var(--border-card)', padding: '0.65rem 1rem', borderRadius: '10px' }}>
            <Search size={18} color="var(--accent-cyan)" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., How does payment processing work? Trace POST /api/orders..."
              style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.92rem', outline: 'none', width: '100%' }}
            />
          </div>
          <button type="submit" disabled={isLoading} className="btn-primary" style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem' }}>
            {isLoading ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
            <span>Understand System</span>
          </button>
        </form>
      </div>

      {/* Query Result Card */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Explanation Box */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-indigo)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              System Analysis & Synthesized Explanation
            </div>
            <p style={{ fontSize: '0.95rem', color: 'white', margin: 0, lineHeight: '1.5' }}>{result.Explanation}</p>
          </div>

          {/* Call Flow Sequence Path */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={18} color="var(--accent-cyan)" /> End-to-End Execution Sequence Trace
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              {result.FlowPath?.map((node: string, idx: number) => (
                <React.Fragment key={idx}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid var(--accent-indigo)', color: 'white', padding: '0.55rem 0.95rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '700' }}>
                    {node}
                  </div>
                  {idx < result.FlowPath.length - 1 && <ArrowRight size={16} color="var(--accent-cyan)" />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Evidence Trail & Blast Radius Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
            {/* Evidence Cards */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--accent-emerald)" /> Code Evidence Trail ({result.Evidence?.length || 0})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.Evidence?.map((item: any, idx: number) => (
                  <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '8px', padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: 'white', fontSize: '0.88rem' }}>{item.symbolName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)' }}>📄 {item.filePath}:{item.startLine}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.rationale}</div>
                    </div>
                    <span style={{ background: 'rgba(74, 222, 128, 0.15)', color: 'var(--accent-emerald)', padding: '0.15rem 0.55rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '800' }}>
                      {Math.round(item.confidenceScore * 100)}% Match
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blast Radius Box */}
            <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-rose)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} color="var(--accent-rose)" /> Blast Radius Impact
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Risk Assessment:</span>
                  <span style={{ color: 'var(--accent-rose)', fontWeight: '800' }}>{result.BlastRadius?.RiskLevel || 'HIGH'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Affected Files:</span>
                  <span style={{ color: 'white', fontWeight: '700' }}>{result.BlastRadius?.AffectedFiles || 12}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Affected REST APIs:</span>
                  <span style={{ color: 'white', fontWeight: '700' }}>{result.BlastRadius?.AffectedApis || 3}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
