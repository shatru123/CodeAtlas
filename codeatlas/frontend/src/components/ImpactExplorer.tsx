import React, { useState, useEffect } from 'react';
import { BlastRadiusResult } from '../types/api';
import { apiService } from '../services/apiService';
import { Zap, AlertTriangle, Globe, Layers, Database, Network, Search, RefreshCw, Cpu } from 'lucide-react';

interface ImpactExplorerProps {
  repoId: string;
}

export const ImpactExplorer: React.FC<ImpactExplorerProps> = ({ repoId }) => {
  const [impact, setImpact] = useState<BlastRadiusResult | null>(null);
  const [searchEntity, setSearchEntity] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchImpact = async (entity?: string) => {
    setLoading(true);
    try {
      const data = await apiService.getImpact(repoId, entity);
      setImpact(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpact();
  }, [repoId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchImpact(searchEntity);
  };

  if (!impact) return null;

  const { targetEntityName, impactScore, riskLevel, affectedControllers, affectedServices, affectedRepositories, affectedDatabases, affectedCrossRepoServices } = impact;

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical': return 'var(--accent-rose)';
      case 'high': return 'var(--accent-amber)';
      case 'medium': return 'var(--accent-cyan)';
      default: return 'var(--accent-emerald)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
      {/* Overview Banner & Search */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(99, 102, 241, 0.12))', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <Zap size={24} color={getRiskColor(riskLevel)} style={{ flexShrink: 0 }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'white' }}>Blast Radius & Change Impact Analysis</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Calculates downstream impact score and affected components when a class, method, or DB table is modified.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.35rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
            <input
              type="text"
              value={searchEntity}
              onChange={(e) => setSearchEntity(e.target.value)}
              placeholder="Enter entity / method (e.g. OrderService)..."
              style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.82rem', outline: 'none', width: '220px' }}
            />
            <button type="submit" style={{ background: 'var(--accent-indigo)', color: 'white', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}>
              Calculate Impact
            </button>
          </form>

          <div style={{ background: 'rgba(0,0,0,0.35)', padding: '0.75rem 1.25rem', borderRadius: '12px', border: `1px solid ${getRiskColor(riskLevel)}`, textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: getRiskColor(riskLevel) }}>{impactScore}/100 ({riskLevel} Risk)</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Blast Radius Score</div>
          </div>
        </div>
      </div>

      {/* Target Component */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Cpu size={20} color="var(--accent-cyan)" />
        <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Analyzing Impact for Component:</span>
        <strong style={{ color: 'white', fontSize: '1rem', fontFamily: 'var(--font-code)' }}>{targetEntityName}</strong>
      </div>

      {/* Impacted Components Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Affected Controllers */}
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-cyan)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Globe size={18} /> Impacted Controllers ({affectedControllers.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {affectedControllers.map((c, i) => (
              <div key={i} style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: '700', color: 'white', wordBreak: 'break-all' }}>{c.name}</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{c.context}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Affected Services */}
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-indigo)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={18} /> Impacted Application Services ({affectedServices.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {affectedServices.map((s, i) => (
              <div key={i} style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: '700', color: 'white', wordBreak: 'break-all' }}>{s.name}</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{s.context}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Affected Repositories & DB */}
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--accent-purple)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Database size={18} /> Impacted Persistence & DB Tables ({affectedDatabases.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {affectedDatabases.map((d, i) => (
              <div key={i} style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: '700', color: 'white', wordBreak: 'break-all' }}>{d.name}</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{d.context}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
