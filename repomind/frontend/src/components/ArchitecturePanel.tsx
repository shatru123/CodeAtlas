import React from 'react';
import { ShieldAlert, CheckCircle2, Layers, Cpu, Server, Database, Globe } from 'lucide-react';
import { ArchitectureSummary } from '../types/api';

interface ArchitecturePanelProps {
  architecture: ArchitectureSummary | null;
}

export const ArchitecturePanel: React.FC<ArchitecturePanelProps> = ({ architecture }) => {
  if (!architecture) return null;

  const { controllers, services, repositories, violations, architecturePattern } = architecture;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Pattern Overview Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <Layers size={22} color="var(--accent-indigo)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>{architecturePattern}</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Detected architectural composition and structural compliance for this repository.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{controllers}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Controllers</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-indigo)' }}>{services}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Services</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--accent-purple)' }}>{repositories}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Repositories</div>
          </div>
        </div>
      </div>

      {/* Layer Diagram & Violations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Layer Hierarchy Representation */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={18} color="var(--accent-cyan)" />
            Layer Structural Hierarchy
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Globe size={20} color="var(--accent-cyan)" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white' }}>Presentation & API Layer</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exposes REST endpoints and processes incoming requests</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>↓ Calls Service Layer Interface</div>

            <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Cpu size={20} color="var(--accent-indigo)" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white' }}>Application & Domain Logic</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Business rules, aggregates, and service workflows</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>↓ Calls Repository & DB Layer</div>

            <div style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Database size={20} color="var(--accent-purple)" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white' }}>Infrastructure & Persistence</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EF Core, Dapper queries, and SQL Server / PostgreSQL</div>
              </div>
            </div>
          </div>
        </div>

        {/* Architectural Violations */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} color="var(--accent-rose)" />
            Architectural Violations ({violations.length})
          </h3>

          {violations.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {violations.map((v) => (
                <div key={v.id} style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fecdd3', marginBottom: '0.3rem' }}>
                    {v.context}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Source Controller: <span style={{ color: 'white', fontWeight: '600' }}>{v.sourceFullName}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Target Table: <span style={{ color: 'white', fontWeight: '600' }}>{v.targetFullName}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px' }}>
              <CheckCircle2 size={36} color="var(--accent-emerald)" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: '700' }}>Clean Architecture Compliant!</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                No direct database access or architectural layer bypasses detected in this codebase.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
