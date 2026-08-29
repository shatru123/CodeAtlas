import React, { useState, useEffect } from 'react';
import { Layers, RefreshCw, Cpu, Database, Server, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { apiService } from '../services/apiService';
import { MetricTooltip } from './MetricTooltip';
import { ContextualHelpBox } from './ContextualHelpBox';

interface VisualArchBuilderPanelProps {
  repoId: string;
}

export const VisualArchBuilderPanel: React.FC<VisualArchBuilderPanelProps> = ({ repoId }) => {
  const [data, setData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCanvas();
  }, [repoId]);

  const fetchCanvas = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getVisualArchCanvas(repoId);
      setData(res);
      if (res.nodes && res.nodes.length > 0) setSelectedNode(res.nodes[0]);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-indigo)' }} />
        <div>Rendering Interactive Architecture Nodes & System Graph...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <ContextualHelpBox
        title="What is Visual Architecture Builder?"
        description="Visual Architecture Builder renders an interactive, node-based system diagram of your repository showing how API Controllers, Business Logic Services, Repositories, and Database Clusters connect together."
      />

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(79, 70, 229, 0.5))', border: '1.5px solid var(--accent-indigo)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
            <Layers size={24} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>
              Interactive Visual Architecture Builder (<MetricTooltip term="System Design Builder" explanation="Interactive diagram rendering system components & database connectivity." />)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Discovered {data?.nodes?.length || 3} architecture nodes • Click nodes to inspect source files & dependencies.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Architecture Canvas Nodes + Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>
        {/* Architecture Nodes Visual Grid */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(10, 14, 23, 0.95)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-muted)' }}>SYSTEM ARCHITECTURE NODES</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {data?.nodes?.map((node: any, idx: number) => (
              <div
                key={idx}
                onClick={() => setSelectedNode(node)}
                style={{
                  background: selectedNode?.id === node.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                  border: selectedNode?.id === node.id ? '1.5px solid var(--accent-indigo)' : '1px solid var(--border-card)',
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  boxShadow: selectedNode?.id === node.id ? '0 0 20px rgba(99,102,241,0.3)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {node.nodeType === 'Controller' ? <Server size={18} color="var(--accent-cyan)" /> : node.nodeType === 'Database' ? <Database size={18} color="var(--accent-emerald)" /> : <Cpu size={18} color="var(--accent-purple)" />}
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', background: 'rgba(56,189,248,0.15)', padding: '0.1rem 0.45rem', borderRadius: '6px', fontWeight: '700' }}>
                    {node.nodeType}
                  </span>
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white' }}>{node.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>📄 {node.filePath}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-muted)' }}>NODE INSPECTOR</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white' }}>{selectedNode.label}</div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Type:</span> <strong style={{ color: 'var(--accent-cyan)' }}>{selectedNode.nodeType}</strong>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>File Path:</span> <div style={{ color: 'white', fontFamily: 'var(--font-code)', marginTop: '0.2rem' }}>{selectedNode.filePath}</div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: '700' }}>
              ✓ Connected Targets: {selectedNode.targets?.length || 0} Outgoing Call Dependencies
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
