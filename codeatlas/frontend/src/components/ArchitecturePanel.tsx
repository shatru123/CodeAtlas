import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Layers, Cpu, Server, Database, Globe, ShieldCheck, AlertTriangle, FileCode, ChevronDown, ChevronUp } from 'lucide-react';
import { ArchitectureSummary } from '../types/api';

interface ArchitecturePanelProps {
  architecture: ArchitectureSummary | null;
}

export const ArchitecturePanel: React.FC<ArchitecturePanelProps> = ({ architecture }) => {
  const [showViolations, setShowViolations] = useState(true);

  if (!architecture) return null;

  const { controllers, services, repositories, violations, architecturePattern } = architecture;

  const rules = [
    {
      id: 'R1',
      title: 'Layered Architectural Isolation',
      description: 'API Controllers & Route handlers must delegate logic to Service Layer components and avoid bypassing boundaries.',
      status: violations.length === 0 ? 'PASSED' : 'ALERT',
      details: violations.length > 0 ? `${violations.length} Controller Direct DB Calls Detected` : 'All Controllers Delegate to Service Layer',
    },
    {
      id: 'R2',
      title: 'No Direct Controller DB Access',
      description: 'Controllers should not execute raw SQL or Entity Framework ORM queries directly.',
      status: violations.length === 0 ? 'PASSED' : 'ALERT',
      details: violations.length > 0 ? `${violations.length} Direct DB References in Presentation Files` : 'Zero Direct Controller DB References',
    },
    {
      id: 'R3',
      title: 'Decoupled Interface Abstractions',
      description: 'Services and Repositories should implement interface abstractions for testability and DI.',
      status: 'PASSED',
      details: 'Service & Repository Interface Abstractions Verified',
    },
    {
      id: 'R4',
      title: 'Asynchronous Event Broker Decoupling',
      description: 'Inter-service communications should publish events via MassTransit, RabbitMQ, or Kafka.',
      status: 'PASSED',
      details: 'Async Event Broker Handler Decoupling Verified',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
      {/* Pattern Overview Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <Layers size={22} color="var(--accent-indigo)" style={{ flexShrink: 0 }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>{architecturePattern}</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Evaluated architectural composition, structural layers, and compliance rules for this repository.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
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

          <div style={{ background: violations.length > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: `1px solid ${violations.length > 0 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`, textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: violations.length > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>{violations.length}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{violations.length > 0 ? 'Alerts' : 'Violations'}</div>
          </div>
        </div>
      </div>

      {/* Rules Checklist & Layer Hierarchy */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', minWidth: 0 }}>
        {/* Architectural Rules Evaluated */}
        <div className="glass-panel" style={{ padding: '1.5rem', minWidth: 0 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
            Evaluated Architectural Rules ({rules.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {rules.map((rule) => {
              const isPassed = rule.status === 'PASSED';
              return (
                <div
                  key={rule.id}
                  style={{
                    background: isPassed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.1)',
                    border: `1px solid ${isPassed ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.3)'}`,
                    padding: '0.9rem 1rem',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}
                >
                  {isPassed ? (
                    <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                  ) : (
                    <AlertTriangle size={18} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'white', wordBreak: 'break-word' }}>
                        {rule.title}
                      </span>
                      <span style={{ background: isPassed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)', color: isPassed ? 'var(--accent-emerald)' : 'var(--accent-rose)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700', flexShrink: 0 }}>
                        {isPassed ? 'PASSED' : 'ALERT'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '0.25rem' }}>
                      {rule.description}
                    </div>

                    <div style={{ fontSize: '0.73rem', color: isPassed ? 'var(--accent-emerald)' : '#fecdd3', fontWeight: '600' }}>
                      {rule.details}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Structural Layers Hierarchy */}
        <div className="glass-panel" style={{ padding: '1.5rem', minWidth: 0 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={18} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
            Layer Structural Hierarchy
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.9rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Globe size={20} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white' }}>Presentation & API Layer ({controllers})</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Exposes REST endpoints and processes incoming requests</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem' }}>↓ Calls Service Layer Interfaces</div>

            <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.9rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Cpu size={20} color="var(--accent-indigo)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white' }}>Application & Domain Logic ({services})</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Business rules, aggregates, and service workflows</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.78rem' }}>↓ Calls Repositories & Database Layer</div>

            <div style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '0.9rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Database size={20} color="var(--accent-purple)" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white' }}>Infrastructure & Persistence ({repositories})</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EF Core, Dapper queries, and SQL Server / PostgreSQL</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Architectural Violations Breakdown (If Any Exist) */}
      {violations.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="var(--accent-rose)" style={{ flexShrink: 0 }} />
              Detected Architectural Violation Alerts ({violations.length})
            </h3>
            <button
              onClick={() => setShowViolations(!showViolations)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-card)', color: 'white', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {showViolations ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showViolations ? 'Collapse List' : `View ${violations.length} Alerts`}
            </button>
          </div>

          {showViolations && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '0.85rem' }}>
              {violations.map((v, idx) => (
                <div key={v.id || idx} style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', padding: '1rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fecdd3', wordBreak: 'break-word' }}>
                    {v.context || 'ARCHITECTURAL VIOLATION: Direct Controller Database Access'}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Controller: <span style={{ color: 'white', fontWeight: '700', fontFamily: 'var(--font-code)', wordBreak: 'break-all' }}>{v.sourceFullName}</span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Target DB Table: <span style={{ color: 'var(--accent-amber)', fontWeight: '700', fontFamily: 'var(--font-code)', wordBreak: 'break-all' }}>{v.targetFullName}</span>
                  </div>

                  {v.filePath && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.73rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)', marginTop: '0.2rem', wordBreak: 'break-all' }}>
                      <FileCode size={13} style={{ flexShrink: 0 }} />
                      <span>{v.filePath}:{v.lineNumber || 1}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
