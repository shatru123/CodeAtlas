import React, { useState } from 'react';
import { GitCommit, Search, ArrowRight, Play, Layers, Code, Sparkles } from 'lucide-react';
import { FunctionalFlow } from '../types/api';
import { FlowDiagram } from './FlowDiagram';

interface FlowExplorerProps {
  flows: FunctionalFlow[];
}

export const FlowExplorer: React.FC<FlowExplorerProps> = ({ flows }) => {
  const [selectedFlowId, setSelectedFlowId] = useState<string>(flows[0]?.id || '');
  const [search, setSearch] = useState('');

  const filteredFlows = flows.filter((f) => {
    return (
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.triggerApi.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase())
    );
  });

  const activeFlow = flows.find((f) => f.id === selectedFlowId) || filteredFlows[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem' }}>
      {/* Flow Sidebar List */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', padding: '0.45rem 0.75rem', borderRadius: '8px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search functional flows..."
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.8rem', outline: 'none', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredFlows.length > 0 ? (
            filteredFlows.map((flow) => {
              const isSelected = activeFlow?.id === flow.id;
              return (
                <div
                  key={flow.id}
                  onClick={() => setSelectedFlowId(flow.id)}
                  style={{
                    background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${isSelected ? 'var(--accent-indigo)' : 'var(--border-card)'}`,
                    boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'white', marginBottom: '0.25rem' }}>
                    {flow.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)' }}>
                    Trigger: {flow.triggerApi}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    {flow.steps.length} Execution Steps
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No execution flows match search.
            </div>
          )}
        </div>
      </div>

      {/* Flow Details & Mermaid Diagram */}
      {activeFlow ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Flow Banner */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <Sparkles size={20} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>{activeFlow.title}</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              {activeFlow.description}
            </p>

            {/* Mermaid SVG Diagram Generated on the Fly */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Interactive Dynamic Mermaid Diagram
              </div>
              <FlowDiagram id={activeFlow.id} markup={activeFlow.mermaidMarkup} />
            </div>

            {/* Step-by-Step Execution Timeline */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white', marginBottom: '0.85rem' }}>
                Execution Sequence ({activeFlow.steps.length} Steps)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeFlow.steps.map((step) => (
                  <div key={step.stepNumber} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', padding: '0.85rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.8rem', color: 'white' }}>
                      {step.stepNumber}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: '700', color: 'white', fontFamily: 'var(--font-code)' }}>
                          {step.nodeName}
                        </span>
                        <span className="badge badge-get" style={{ fontSize: '0.68rem' }}>
                          {step.nodeType}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Play size={36} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
          <p>Select a functional flow to inspect its sequence diagram and execution steps.</p>
        </div>
      )}
    </div>
  );
};
