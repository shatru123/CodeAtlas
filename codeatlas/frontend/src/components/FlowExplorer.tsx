import React, { useState } from 'react';
import { Search, Sparkles, Play, Layers, FileCode, Check, Copy, Zap, Database, Radio, Globe, Terminal } from 'lucide-react';
import { FunctionalFlow } from '../types/api';
import { FlowDiagram } from './FlowDiagram';

interface FlowExplorerProps {
  flows: FunctionalFlow[];
}

export const FlowExplorer: React.FC<FlowExplorerProps> = ({ flows }) => {
  const [selectedFlowId, setSelectedFlowId] = useState<string>(flows[0]?.id || '');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const filteredFlows = flows.filter((f) => {
    const matchesSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.triggerApi.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'API' && f.triggerApi.startsWith('HTTP')) ||
      (filterType === 'DB' && f.steps.some((s) => s.nodeType === 'Database')) ||
      (filterType === 'EVENT' && f.steps.some((s) => s.nodeType === 'Event'));

    return matchesSearch && matchesFilter;
  });

  const activeFlow = flows.find((f) => f.id === selectedFlowId) || filteredFlows[0];

  const getNodeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'API': return <Globe size={14} color="var(--accent-cyan)" />;
      case 'CONTROLLER': return <Terminal size={14} color="var(--accent-indigo)" />;
      case 'SERVICE': return <Zap size={14} color="var(--accent-purple)" />;
      case 'DATABASE': return <Database size={14} color="var(--accent-emerald)" />;
      case 'EVENT': return <Radio size={14} color="var(--accent-amber)" />;
      default: return <Layers size={14} color="var(--text-muted)" />;
    }
  };

  const getNodeBadgeStyle = (type: string) => {
    switch (type.toUpperCase()) {
      case 'API': return { bg: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', border: 'rgba(56, 189, 248, 0.3)' };
      case 'CONTROLLER': return { bg: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)', border: 'rgba(99, 102, 241, 0.3)' };
      case 'SERVICE': return { bg: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)', border: 'rgba(168, 85, 247, 0.3)' };
      case 'DATABASE': return { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'EVENT': return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', border: 'rgba(245, 158, 11, 0.3)' };
      default: return { bg: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)', border: 'var(--border-card)' };
    }
  };

  const handleCopyStep = (stepNumber: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNumber);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  return (
    <div className="sidebar-main-grid">
      {/* Left Sidebar: Flow List & Filters */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search functional flows..."
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.82rem', outline: 'none', width: '100%' }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Flows' },
            { id: 'API', label: 'REST APIs' },
            { id: 'DB', label: 'Database' },
            { id: 'EVENT', label: 'Events' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              style={{
                background: filterType === tab.id ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.05)',
                color: filterType === tab.id ? 'white' : 'var(--text-muted)',
                border: '1px solid var(--border-card)',
                padding: '0.25rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.73rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Flow Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredFlows.length > 0 ? (
            filteredFlows.map((flow) => {
              const isSelected = activeFlow?.id === flow.id;
              return (
                <div
                  key={flow.id}
                  onClick={() => setSelectedFlowId(flow.id)}
                  style={{
                    background: isSelected ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(168, 85, 247, 0.12))' : 'rgba(0,0,0,0.3)',
                    border: `1.5px solid ${isSelected ? 'var(--accent-indigo)' : 'var(--border-card)'}`,
                    boxShadow: isSelected ? '0 0 20px rgba(99, 102, 241, 0.25)' : 'none',
                    padding: '0.9rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: 'white', wordBreak: 'break-word', flex: 1, minWidth: 0 }}>
                      {flow.title}
                    </span>
                    <span style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--accent-cyan)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '700', flexShrink: 0 }}>
                      {flow.steps.length} Steps
                    </span>
                  </div>

                  <div style={{ fontSize: '0.76rem', color: 'var(--accent-indigo)', fontFamily: 'var(--font-code)', wordBreak: 'break-all', marginBottom: '0.35rem' }}>
                    {flow.triggerApi}
                  </div>

                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: '1.35', wordBreak: 'break-word' }}>
                    {flow.description.length > 85 ? `${flow.description.substring(0, 85)}...` : flow.description}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No flows match your search filter.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Flow Canvas & Timeline */}
      {activeFlow ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
          {/* Main Title Banner */}
          <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', minWidth: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                <Sparkles size={22} color="var(--accent-cyan)" />
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white', wordBreak: 'break-word' }}>{activeFlow.title}</h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', wordBreak: 'break-word' }}>
                {activeFlow.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flexShrink: 0 }}>
              <span className="badge badge-get" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-indigo)', padding: '0.4rem 0.8rem', fontSize: '0.78rem', wordBreak: 'break-all' }}>
                Trigger: {activeFlow.triggerApi}
              </span>
            </div>
          </div>

          {/* Interactive Mermaid SVG Diagram Canvas */}
          <div style={{ minWidth: 0 }}>
            <FlowDiagram id={activeFlow.id} markup={activeFlow.mermaidMarkup} />
          </div>

          {/* Step-by-Step Execution Sequence Cards */}
          <div className="glass-panel" style={{ padding: '1.5rem', minWidth: 0 }}>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="var(--accent-purple)" />
              Step-by-Step Execution Path ({activeFlow.steps.length} Nodes)
            </div>

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '0.5rem', minWidth: 0 }}>
              {/* Vertical Gradient Connector Line */}
              <div
                style={{
                  position: 'absolute',
                  left: '21px',
                  top: '20px',
                  bottom: '20px',
                  width: '3px',
                  background: 'linear-gradient(to bottom, var(--accent-cyan), var(--accent-indigo), var(--accent-purple), var(--accent-emerald))',
                  borderRadius: '2px',
                  zIndex: 0,
                }}
              />

              {activeFlow.steps.map((step) => {
                const badge = getNodeBadgeStyle(step.nodeType);
                const Icon = getNodeIcon(step.nodeType);
                return (
                  <div
                    key={step.stepNumber}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      minWidth: 0,
                    }}
                  >
                    {/* Pulsing Node Badge Number */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
                        border: '2px solid #0b0f17',
                        boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '0.85rem',
                        color: 'white',
                        flexShrink: 0,
                        marginTop: '0.2rem',
                      }}
                    >
                      {step.stepNumber}
                    </div>

                    {/* Step Card Content */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        background: 'rgba(0,0,0,0.35)',
                        border: '1px solid var(--border-card)',
                        padding: '1.1rem 1.25rem',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                      }}
                    >
                      {/* Top Header Row with flex-wrap and minWidth 0 */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', minWidth: 0, flex: 1 }}>
                          <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '0.22rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                            {Icon}
                            {step.nodeType}
                          </span>
                          <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'white', fontFamily: 'var(--font-code)', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>
                            {step.nodeName}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopyStep(step.stepNumber, step.nodeName)}
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-card)', padding: '0.25rem 0.6rem', borderRadius: '6px', color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', flexShrink: 0 }}
                        >
                          {copiedStep === step.stepNumber ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                          {copiedStep === step.stepNumber ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      {/* Description */}
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.45', wordBreak: 'break-word' }}>
                        {step.description}
                      </div>

                      {/* File Link */}
                      {step.filePath && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)', wordBreak: 'break-all', marginTop: '0.1rem' }}>
                          <FileCode size={13} style={{ flexShrink: 0 }} />
                          <span>{step.filePath}:{step.lineNumber || 1}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
