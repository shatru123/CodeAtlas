import React, { useState, useEffect } from 'react';
import { Rocket, ArrowUpCircle, Check, Copy, RefreshCw, Zap, PackageCheck, FileCode, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/apiService';

interface ModernizationPanelProps {
  repoId: string;
}

export const ModernizationPanel: React.FC<ModernizationPanelProps> = ({ repoId }) => {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    fetchModernization();
  }, [repoId]);

  const fetchModernization = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getModernization(repoId);
      setReport(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-purple)' }} />
        <div>Analyzing .NET Framework Modernization & Upgrade Opportunities...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.9), rgba(88, 28, 135, 0.5))', border: '1.5px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)' }}>
              <Rocket size={26} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>Codebase Modernization & Migration Assistant</h2>
                <span style={{ background: 'rgba(168, 85, 247, 0.18)', color: 'var(--accent-purple)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                  Target: {report?.targetFramework || '.NET 8.0'}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Step-by-step modernization advisor converting legacy MVC controllers to .NET 8 Minimal APIs & C# 12 features.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>MODERNIZATION SCORE</div>
            <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--accent-emerald)' }}>{report?.modernizationScore || 92}/100</div>
          </div>
        </div>
      </div>

      {/* Action Items List with Side-by-Side Code Snippets */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color="var(--accent-amber)" /> Modernization Action Items ({report?.actionItems?.length || 0})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {report?.actionItems?.map((item: any, idx: number) => (
            <div key={idx} style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <FileCode size={18} color="var(--accent-indigo)" />
                  <span style={{ fontWeight: '800', color: 'white', fontSize: '0.98rem' }}>{item.title}</span>
                  <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', padding: '0.1rem 0.55rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                    {item.category}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: '700' }}>Est: {item.effortEstimate}</div>
              </div>

              {/* Side-by-Side Code Box */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--accent-rose)', fontWeight: '700', marginBottom: '0.35rem' }}>❌ Current Pattern</div>
                  <pre style={{ background: '#0d1117', color: '#f87171', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontFamily: 'var(--font-code)', margin: 0, overflowX: 'auto', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                    {item.currentCodeSnippet}
                  </pre>
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <div style={{ fontSize: '0.73rem', color: 'var(--accent-emerald)', fontWeight: '700' }}>✨ Recommended .NET 8 Pattern</div>
                    <button onClick={() => handleCopy(item.recommendedCodeSnippet, idx)} style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {copiedIdx === idx ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedIdx === idx ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre style={{ background: '#0d1117', color: '#4ade80', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontFamily: 'var(--font-code)', margin: 0, overflowX: 'auto', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                    {item.recommendedCodeSnippet}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
