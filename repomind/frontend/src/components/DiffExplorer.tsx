import React, { useState, useEffect } from 'react';
import { BranchDiffResult } from '../types/api';
import { apiService } from '../services/apiService';
import { GitBranch, AlertTriangle, PlusCircle, MinusCircle, ShieldAlert, GitCompare, CheckCircle2 } from 'lucide-react';

interface DiffExplorerProps {
  repoId: string;
}

export const DiffExplorer: React.FC<DiffExplorerProps> = ({ repoId }) => {
  const [diff, setDiff] = useState<BranchDiffResult | null>(null);
  const [targetBranch, setTargetBranch] = useState('main');
  const [loading, setLoading] = useState(false);

  const fetchDiff = async (branch?: string) => {
    setLoading(true);
    try {
      const data = await apiService.getDiff(repoId, branch || targetBranch);
      setDiff(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiff();
  }, [repoId]);

  if (!diff) return null;

  const { sourceBranch, addedApis, removedApis, addedEntities, removedEntities, newViolationsIntroduced } = diff;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(56, 189, 248, 0.12))', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <GitCompare size={24} color="var(--accent-indigo)" style={{ flexShrink: 0 }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'white' }}>Git Branch Snapshot Diffing & Architectural Drift</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Compare AST entities, REST APIs, and architectural violations introduced between Git branches.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-card)', fontSize: '0.85rem', color: 'white' }}>
            Source: <strong style={{ color: 'var(--accent-cyan)' }}>{sourceBranch}</strong> ➔ Target: <strong style={{ color: 'var(--accent-purple)' }}>{targetBranch}</strong>
          </div>
        </div>
      </div>

      {/* Delta Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', minWidth: 0 }}>
        {/* Added APIs */}
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlusCircle size={18} /> Added REST APIs ({addedApis.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
            {addedApis.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                No new REST APIs added in this branch.
              </div>
            ) : (
              addedApis.map((api) => (
                <div key={api.id} style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0 }}>
                  <div style={{ fontWeight: '700', color: 'white', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: '1.4' }}>
                    <span className="badge badge-get" style={{ marginRight: '0.4rem', fontSize: '0.68rem' }}>{api.httpMethod}</span>
                    {api.route}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', wordBreak: 'break-word', fontFamily: 'var(--font-code)' }}>
                    Action: {api.controllerName}.{api.actionName}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Added AST Entities */}
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlusCircle size={18} /> New AST Components ({addedEntities.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
            {addedEntities.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
                No new AST components added.
              </div>
            ) : (
              addedEntities.map((e) => (
                <div key={e.id} style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.75rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0 }}>
                  <div style={{ fontWeight: '700', color: 'white', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: '1.4' }}>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: '800', marginRight: '0.3rem' }}>[{e.type}]</span>
                    {e.name}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', wordBreak: 'break-all', fontFamily: 'var(--font-code)', lineHeight: '1.3' }}>
                    {e.filePath}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Violations Introduced */}
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(244, 63, 94, 0.3)', display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldAlert size={18} /> Architectural Drift Alerts ({newViolationsIntroduced.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 0 }}>
            {newViolationsIntroduced.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0' }}>
                <CheckCircle2 size={16} /> Zero architectural drift or rule violations introduced!
              </div>
            ) : (
              newViolationsIntroduced.map((v) => (
                <div key={v.id} style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '0.75rem 0.9rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: 0 }}>
                  <div style={{ fontWeight: '700', color: '#fecdd3', wordBreak: 'break-word', overflowWrap: 'anywhere', lineHeight: '1.4' }}>
                    {v.context}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', wordBreak: 'break-all', fontFamily: 'var(--font-code)', lineHeight: '1.3' }}>
                    Source: {v.sourceFullName} ➔ Target: {v.targetFullName}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
