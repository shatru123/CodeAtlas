import React, { useState } from 'react';
import { SearchCode, AlertTriangle, Sparkles, GitCommit, FileText, CheckCircle, ArrowRight, Play, RefreshCw } from 'lucide-react';
import { apiService } from '../services/apiService';

interface RcaEnginePanelProps {
  repoId: string;
}

export const RcaEnginePanel: React.FC<RcaEnginePanelProps> = ({ repoId }) => {
  const [stackTrace, setStackTrace] = useState(
    'System.NullReferenceException: Object reference not set to an instance of an object.\n  at CodeAtlas.Application.Services.PaymentService.ProcessPaymentAsync(PaymentRequest req) in src/Services/PaymentService.cs:line 84\n  at CodeAtlas.Api.Controllers.CheckoutController.Checkout(CheckoutRequest req) in src/Controllers/CheckoutController.cs:line 42'
  );
  const [rcaResult, setRcaResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyzeRca = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!stackTrace.trim()) return;

    setIsLoading(true);
    try {
      const data = await apiService.analyzeRca(repoId, stackTrace);
      setRcaResult(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixWithAgent = async () => {
    if (!rcaResult) return;
    try {
      await apiService.createAgentTask(repoId, `Fix production incident: ${rcaResult.likelyRootCause}`, 1);
      alert('Bug Fix Agent task launched successfully! Switch to BUILD -> Agent Task Center to view progress.');
    } catch {
      // Fallback
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(153, 27, 27, 0.5))', border: '1.5px solid var(--accent-rose)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #ef4444, #f97316)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
            <SearchCode size={26} color="white" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>Production Incident Root Cause Analysis (RCA) Engine</h2>
              <span style={{ background: 'rgba(239, 68, 68, 0.18)', color: 'var(--accent-rose)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                Git & AST Correlator Active
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Paste production error logs or stack traces to correlate directly with AST call graphs, Git commits, and trigger 1-click Agent fixes.
            </p>
          </div>
        </div>

        {/* Stack Trace Input Form */}
        <form onSubmit={handleAnalyzeRca} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <textarea
            rows={4}
            value={stackTrace}
            onChange={(e) => setStackTrace(e.target.value)}
            placeholder="Paste production error stack trace or log snippet here..."
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-card)', padding: '0.75rem 1rem', borderRadius: '10px', color: '#f87171', fontSize: '0.82rem', fontFamily: 'var(--font-code)', outline: 'none', resize: 'vertical' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={isLoading} className="btn-primary" style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem' }}>
              {isLoading ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
              <span>Investigate Root Cause</span>
            </button>
          </div>
        </form>
      </div>

      {/* RCA Result Panel */}
      {rcaResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Main Diagnosis & Agent Trigger */}
          <div className="glass-panel" style={{ padding: '1.25rem', borderLeft: '4px solid var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-rose)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Likely Root Cause Identified ({Math.round(rcaResult.confidenceScore * 100)}% Confidence)
              </div>
              <p style={{ fontSize: '1rem', fontWeight: '700', color: 'white', margin: 0 }}>{rcaResult.likelyRootCause}</p>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Regressing Symbol: <code style={{ color: 'var(--accent-cyan)' }}>{rcaResult.targetSymbol}</code> ({rcaResult.targetFile})
              </div>
            </div>

            <button onClick={handleFixWithAgent} className="btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              <Play size={16} /> <span>⚡ Fix Incident with Agent</span>
            </button>
          </div>

          {/* Git Commit Correlation Box */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'white', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GitCommit size={18} color="var(--accent-purple)" /> Git Commit Correlation & Regression Author
            </h3>
            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'white' }}>Commit SHA: {rcaResult.regressingCommitHash}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Author: {rcaResult.regressingAuthor}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-indigo)', fontFamily: 'var(--font-code)', marginTop: '0.2rem' }}>"{rcaResult.commitMessage}"</div>
              </div>
              <span style={{ background: 'rgba(168, 85, 247, 0.18)', color: 'var(--accent-purple)', padding: '0.2rem 0.65rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800' }}>
                Regression Origin
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
