import React, { useState } from 'react';
import { Activity, AlertCircle, FileCode, GitCommit, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { MetricTooltip } from './MetricTooltip';
import { ContextualHelpBox } from './ContextualHelpBox';

interface TelemetryIncidentStudioPanelProps {
  repoId: string;
}

export const TelemetryIncidentStudioPanel: React.FC<TelemetryIncidentStudioPanelProps> = ({ repoId }) => {
  const [rawLog, setRawLog] = useState<string>(`System.TimeoutException: The HTTP request to remote Git repository timed out after 15000ms.
   at CodeAtlas.Infrastructure.Git.GitMetadataExtractor.RunGitCommand(String workingDir, String arguments) in GitMetadataExtractor.cs:line 125
   at CodeAtlas.Api.Controllers.RepositoriesController.ScanGitHubRepository(GitHubScanRequestDto request) in RepositoriesController.cs:line 58`);
  const [incidentResult, setIncidentResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleParseLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawLog.trim()) return;

    setIsAnalyzing(true);
    try {
      const data = await apiService.parseTelemetryLog(repoId, rawLog);
      setIncidentResult(data);
    } catch {
      // Fallback
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <ContextualHelpBox
        title="What is Telemetry Incident Studio & Log Correlation?"
        description="Telemetry Incident Studio allows developers to paste raw production stack traces, JSON logs, or APM telemetry errors. CodeAtlas correlates the stack trace with exact AST code symbols, identifies regressing Git commits, and generates a 1-click executable patch."
      />

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(30, 58, 138, 0.6))', border: '1.5px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #38bdf8, #0284c7)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(56,189,248,0.4)' }}>
            <Activity size={24} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>
              Production Telemetry Incident Studio (<MetricTooltip term="Log Correlation Engine" explanation="Correlates production stack traces directly with AST symbols and Git blame commits to synthesize instant auto-fix patches." />)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Paste raw production stack traces or APM log JSONs to correlate AST symbols and generate 1-click fixes.
            </p>
          </div>
        </div>
      </div>

      {/* Input Log Form */}
      <form onSubmit={handleParseLog} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white' }}>Paste Production Stack Trace / APM Log:</label>
        <textarea
          rows={5}
          value={rawLog}
          onChange={(e) => setRawLog(e.target.value)}
          style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-card)', padding: '0.85rem', borderRadius: '10px', color: '#38bdf8', fontSize: '0.82rem', fontFamily: 'var(--font-code)', outline: 'none' }}
        />
        <button type="submit" disabled={isAnalyzing} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
          {isAnalyzing ? <RefreshCw size={15} className="spin" /> : <Sparkles size={15} />}
          <span>Correlate Stack Trace with AST</span>
        </button>
      </form>

      {/* Incident Result Timeline */}
      {incidentResult && (
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <AlertCircle size={20} color="var(--accent-rose)" />
              <strong style={{ fontSize: '1.1rem', color: 'white' }}>{incidentResult.errorType}</strong>
            </div>
            <span style={{ background: 'rgba(244,63,94,0.2)', color: 'var(--accent-rose)', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
              Matched Line #{incidentResult.errorLineNumber}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AST FILE & SYMBOL MATCH</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>📄 {incidentResult.matchedFile}</div>
              <div style={{ fontSize: '0.78rem', color: 'white', marginTop: '0.1rem' }}>{incidentResult.matchedSymbol}</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REGRESSING COMMIT & AUTHOR</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '0.2rem' }}>Commit #{incidentResult.regressingCommit}</div>
              <div style={{ fontSize: '0.78rem', color: 'white', marginTop: '0.1rem' }}>Author: {incidentResult.regressingAuthor}</div>
            </div>
          </div>

          {/* Proposed Fix Patch Code */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>⚡ Proposed Auto-Remediation Code Patch:</div>
            <pre style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-card)', padding: '0.85rem', borderRadius: '8px', color: '#a7f3d0', fontSize: '0.82rem', fontFamily: 'var(--font-code)' }}>
              {incidentResult.proposedFixPatch}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
