import React from 'react';
import { Compass, Hammer, SearchCode, ShieldCheck, Activity } from 'lucide-react';

export type PillarId = 'understand' | 'build' | 'investigate' | 'architecture' | 'health';

interface TopPillarNavProps {
  activePillar: PillarId;
  onSelectPillar: (pillar: PillarId) => void;
  activeSubTab: string;
  onSelectSubTab: (subTab: string) => void;
}

export const TopPillarNav: React.FC<TopPillarNavProps> = ({
  activePillar,
  onSelectPillar,
  activeSubTab,
  onSelectSubTab,
}) => {
  const pillars = [
    {
      id: 'understand' as PillarId,
      label: 'UNDERSTAND',
      icon: Compass,
      description: 'Universal System Explorer, Knowledge Graph, Call Graphs & Traces',
      subTabs: [
        { id: 'system_explorer', label: 'Universal System Explorer' },
        { id: 'graph', label: 'Knowledge Graph' },
        { id: 'apis', label: 'REST APIs Catalog' },
        { id: 'databases', label: 'Database & ORM' },
        { id: 'events', label: 'Messaging Events' },
        { id: 'flows', label: 'Functional Flows' },
        { id: 'infra', label: 'Infra Topology' },
      ],
    },
    {
      id: 'build' as PillarId,
      label: 'BUILD',
      icon: Hammer,
      description: 'Autonomous AI Coding Agent, Refactoring Bot, PR Generator',
      subTabs: [
        { id: 'agent_tasks', label: 'Agent Task Center' },
        { id: 'ai', label: 'AI RAG Assistant' },
        { id: 'runner', label: 'Code Execution Runner' },
        { id: 'modernize', label: 'Framework Modernization' },
      ],
    },
    {
      id: 'investigate' as PillarId,
      label: 'INVESTIGATE',
      icon: SearchCode,
      description: 'Root Cause Analysis, OpenTelemetry APM Metrics, Traces & Logs',
      subTabs: [
        { id: 'rca', label: 'Root Cause Analysis (RCA)' },
        { id: 'telemetry', label: 'OpenTelemetry APM Overlay' },
        { id: 'impact', label: 'Blast Radius Impact' },
        { id: 'diff', label: 'Git Branch Diff' },
      ],
    },
    {
      id: 'architecture' as PillarId,
      label: 'ARCHITECTURE',
      icon: ShieldCheck,
      description: 'Architecture Graph, Clean Rules, Violation Alerts & Guard',
      subTabs: [
        { id: 'architecture', label: 'Architecture & Rules' },
        { id: 'mesh', label: 'Workspace Mesh' },
        { id: 'erd', label: 'Database ERD' },
        { id: 'handbook', label: 'Handbook Exporter' },
      ],
    },
    {
      id: 'health' as PillarId,
      label: 'ENGINEERING HEALTH',
      icon: Activity,
      description: 'Engineering Health Score Radar, Technical Debt & CVE Audit',
      subTabs: [
        { id: 'doctor', label: 'AI Tech Debt Doctor' },
        { id: 'security', label: 'Security & CVE Audit' },
        { id: 'packages', label: 'Packages & Vulnerabilities' },
      ],
    },
  ];

  const currentPillarObj = pillars.find((p) => p.id === activePillar) || pillars[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
      {/* 5 Flagship Navigation Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const isActive = activePillar === pillar.id;
          return (
            <button
              key={pillar.id}
              onClick={() => {
                onSelectPillar(pillar.id);
                onSelectSubTab(pillar.subTabs[0].id);
              }}
              className="glass-panel"
              style={{
                padding: '0.85rem 1rem',
                border: isActive ? '1.5px solid var(--accent-indigo)' : '1px solid var(--border-card)',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(30, 27, 75, 0.4))'
                  : 'rgba(0, 0, 0, 0.35)',
                color: isActive ? 'white' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  background: isActive ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.06)',
                  padding: '0.4rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color={isActive ? 'white' : 'var(--text-muted)'} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.04em', color: isActive ? 'white' : 'var(--text-muted)' }}>
                  {pillar.label}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pillar.subTabs.length} Capabilities
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sub-Tabs Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', background: 'rgba(0,0,0,0.4)', padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-cyan)', textTransform: 'uppercase', marginRight: '0.5rem' }}>
          {currentPillarObj.label}:
        </span>
        {currentPillarObj.subTabs.map((sub) => {
          const isSubActive = activeSubTab === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => onSelectSubTab(sub.id)}
              style={{
                background: isSubActive ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.05)',
                color: isSubActive ? 'white' : 'var(--text-muted)',
                border: '1px solid var(--border-card)',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {sub.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
