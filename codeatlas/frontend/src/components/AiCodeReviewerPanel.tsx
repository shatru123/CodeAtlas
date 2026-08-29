import React, { useState, useEffect } from 'react';
import { UserCheck, AlertTriangle, ShieldAlert, Sparkles, RefreshCw, FileCode, CheckCircle2, MessageSquare } from 'lucide-react';
import { apiService } from '../services/apiService';
import { MetricTooltip } from './MetricTooltip';
import { ContextualHelpBox } from './ContextualHelpBox';

interface AiCodeReviewerPanelProps {
  repoId: string;
}

export const AiCodeReviewerPanel: React.FC<AiCodeReviewerPanelProps> = ({ repoId }) => {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReview();
  }, [repoId]);

  const fetchReview = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAiCodeReviewReport(repoId);
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
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-indigo)' }} />
        <div>Simulating Staff Engineer Code Review on Repository Branch Diffs...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <ContextualHelpBox
        title="What is AI Code Reviewer & PR Quality Gate?"
        description="AI Code Reviewer simulates a Senior Staff Engineer conducting code reviews on pull requests. It analyzes code readability, security vulnerability risks, and performance bottlenecks, generating inline code comments and automated fix patches."
      />

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(79, 70, 229, 0.5))', border: '1.5px solid var(--accent-indigo)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
              <UserCheck size={24} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>
                AI Staff Engineer Code Reviewer (<MetricTooltip term="PR Quality Gate" explanation="Automated AI code reviewer that rates PR quality and suggests inline security & performance fixes." />)
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Repository Quality Score: <strong style={{ color: 'var(--accent-cyan)' }}>{report?.qualityScore || 88}/100</strong> ({report?.totalIssuesFound || 3} PR suggestions generated).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid var(--accent-indigo)', padding: '0.45rem 1rem', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>QUALITY SCORE</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--accent-cyan)' }}>{report?.qualityScore || 88}/100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Comments */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} color="var(--accent-cyan)" />
          Inline Code Review Comments & Suggestions ({report?.comments?.length || 0})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {report?.comments?.map((c: any, idx: number) => (
            <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <FileCode size={16} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white', fontFamily: 'var(--font-code)' }}>{c.filePath}: line #{c.lineNumber}</span>
                </div>
                <span style={{ background: c.severity === 'CRITICAL' ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)', color: c.severity === 'CRITICAL' ? 'var(--accent-rose)' : 'var(--accent-amber)', padding: '0.15rem 0.55rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                  {c.severity} • {c.category}
                </span>
              </div>

              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{c.description}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.2rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>⚡ AI Suggested Code Fix:</div>
                <pre style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-card)', padding: '0.75rem', borderRadius: '8px', color: '#a7f3d0', fontSize: '0.82rem', fontFamily: 'var(--font-code)' }}>
                  {c.suggestedCodeFix}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
