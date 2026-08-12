import React, { useState, useEffect } from 'react';
import { BranchDiffResult } from '../types/api';
import { apiService } from '../services/apiService';
import { GitBranch, AlertTriangle, PlusCircle, MinusCircle, ShieldAlert, GitCompare } from 'lucide-react';

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

      {/* Delta Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Added APIs */}
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-emerald)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlusCircle size={18} /> Added REST APIs ({addedApis.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {addedApis.map((api) => (
              <div key={api.id} style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: '700', color: 'white' }}>{api.httpMethod} {api.route}</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{api.controllerName}.{api.actionName}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Added AST Entities */}
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-cyan)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PlusCircle size={18} /> New AST Components ({addedEntities.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {addedEntities.map((e) => (
              <div key={e.id} style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: '700', color: 'white' }}>{e.type}: {e.name}</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{e.filePath}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Violations Introduced */}
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-rose)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldAlert size={18} /> Architectural Drift Alerts ({newViolationsIntroduced.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {newViolationsIntroduced.map((v) => (
              <div key={v.id} style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: '700', color: '#fecdd3' }}>{v.context}</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>Source: {v.sourceFullName} ➔ Target DB: {v.targetFullName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
