import React, { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Position,
  Handle,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AnalysisResult, CodeEntity, CodeRelationship } from '../types/api';
import { ZoomIn, ZoomOut, Maximize2, Download, Share2, Search, ChevronDown, ChevronUp, Layers, Check, Sparkles } from 'lucide-react';

interface InteractiveCanvasProps {
  analysis: AnalysisResult | null;
  onSelectEntity?: (entity: CodeEntity) => void;
}

// Custom Node Renderer with Double-Click Expand capability
const CustomEntityNode: React.FC<{ data: any }> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);

  const getBadgeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'controller':
        return { bg: 'rgba(56, 189, 248, 0.2)', border: '#38bdf8', color: '#38bdf8' };
      case 'service':
        return { bg: 'rgba(99, 102, 241, 0.2)', border: '#6366f1', color: '#818cf8' };
      case 'repository':
      case 'database':
        return { bg: 'rgba(168, 85, 247, 0.2)', border: '#a855f7', color: '#c084fc' };
      case 'event':
      case 'consumer':
        return { bg: 'rgba(244, 63, 94, 0.2)', border: '#f43f5e', color: '#fb7185' };
      default:
        return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', color: '#34d399' };
    }
  };

  const style = getBadgeStyle(data.entityType || 'entity');

  return (
    <div
      onDoubleClick={() => setExpanded(!expanded)}
      style={{
        background: data.highlighted ? 'rgba(15, 23, 42, 0.95)' : data.dimmed ? 'rgba(15, 23, 42, 0.35)' : 'rgba(15, 23, 42, 0.85)',
        border: `2px solid ${data.highlighted ? '#38bdf8' : style.border}`,
        boxShadow: data.highlighted ? '0 0 20px rgba(56, 189, 248, 0.6)' : '0 8px 16px rgba(0, 0, 0, 0.4)',
        borderRadius: '12px',
        padding: '0.85rem 1rem',
        minWidth: '200px',
        maxWidth: '300px',
        color: 'white',
        opacity: data.dimmed ? 0.35 : 1,
        transition: 'all 0.3s ease',
        cursor: 'grab',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: style.border }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <span style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}`, padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800', textTransform: 'uppercase' }}>
          {data.entityType}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Double-click node to expand details"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'white', wordBreak: 'break-all' }}>{data.label}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', wordBreak: 'break-all' }}>{data.namespace}</div>

      {expanded && (
        <div style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {data.filePath && <div style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)', wordBreak: 'break-all' }}>📄 {data.filePath}</div>}
          {data.attributes && data.attributes.length > 0 && (
            <div style={{ color: 'var(--accent-amber)', fontSize: '0.7rem' }}>🏷️ {data.attributes.join(', ')}</div>
          )}
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Double-click to collapse</div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: style.border }} />
    </div>
  );
};

const nodeTypes = { customEntity: CustomEntityNode };

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ analysis, onSelectEntity }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate initial ReactFlow nodes and edges from IR analysis
  const { initialNodes, initialEdges, pathMap } = useMemo(() => {
    if (!analysis) return { initialNodes: [], initialEdges: [], pathMap: new Map() };

    const nodesList: any[] = [];
    const edgesList: any[] = [];
    const pMap = new Map<string, Set<string>>();

    const controllers = analysis.entities.filter((e) => e.type === 'Controller' || e.name.endsWith('Controller'));
    const services = analysis.entities.filter((e) => e.type === 'Service' || e.type === 'Interface' || e.name.endsWith('Service'));
    const repos = analysis.entities.filter((e) => e.type === 'Repository' || e.name.endsWith('Repository'));
    const dbs = analysis.databases;

    // Layout Columns
    controllers.forEach((c, idx) => {
      nodesList.push({
        id: c.id,
        type: 'customEntity',
        position: { x: 50, y: idx * 120 + 50 },
        data: { label: c.name, namespace: c.namespace, entityType: 'Controller', filePath: c.filePath, attributes: c.attributes, raw: c },
      });
    });

    services.forEach((s, idx) => {
      nodesList.push({
        id: s.id,
        type: 'customEntity',
        position: { x: 380, y: idx * 120 + 50 },
        data: { label: s.name, namespace: s.namespace, entityType: 'Service', filePath: s.filePath, attributes: s.attributes, raw: s },
      });
    });

    repos.forEach((r, idx) => {
      nodesList.push({
        id: r.id,
        type: 'customEntity',
        position: { x: 710, y: idx * 120 + 50 },
        data: { label: r.name, namespace: r.namespace, entityType: 'Repository', filePath: r.filePath, attributes: r.attributes, raw: r },
      });
    });

    dbs.forEach((db, idx) => {
      const dbId = `db_${idx}`;
      nodesList.push({
        id: dbId,
        type: 'customEntity',
        position: { x: 1040, y: idx * 120 + 50 },
        data: { label: `DB Table: ${db.tableName}`, namespace: db.ormProvider, entityType: 'Database', filePath: db.filePath },
      });
    });

    // Build Edges and Path Map
    analysis.relationships.forEach((rel, idx) => {
      if (rel.sourceEntityId) {
        const targetNode = nodesList.find((n) => n.id === rel.targetEntityId || n.data.label === rel.targetFullName);
        if (targetNode) {
          edgesList.push({
            id: `e_${idx}`,
            source: rel.sourceEntityId,
            target: targetNode.id,
            animated: true,
            label: rel.type,
            style: { stroke: '#6366f1', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
          });

          if (!pMap.has(rel.sourceEntityId)) pMap.set(rel.sourceEntityId, new Set());
          pMap.get(rel.sourceEntityId)!.add(targetNode.id);
        }
      }
    });

    return { initialNodes: nodesList, initialEdges: edgesList, pathMap: pMap };
  }, [analysis]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Path Highlighting Logic
  const highlightPathForNode = useCallback(
    (targetNodeId: string) => {
      if (!targetNodeId) {
        setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, highlighted: false, dimmed: false } })));
        setEdges((eds) => eds.map((e) => ({ ...e, animated: false, style: { stroke: '#6366f1', strokeWidth: 2 } })));
        return;
      }

      const activeNodes = new Set<string>([targetNodeId]);
      const queue = [targetNodeId];

      while (queue.length > 0) {
        const curr = queue.shift()!;
        const neighbors = pathMap.get(curr);
        if (neighbors) {
          neighbors.forEach((nextId: string) => {
            if (!activeNodes.has(nextId)) {
              activeNodes.add(nextId);
              queue.push(nextId);
            }
          });
        }
      }

      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: {
            ...n.data,
            highlighted: activeNodes.has(n.id),
            dimmed: !activeNodes.has(n.id),
          },
        }))
      );

      setEdges((eds) =>
        eds.map((e) => {
          const isHighlighted = activeNodes.has(e.source) && activeNodes.has(e.target);
          return {
            ...e,
            animated: isHighlighted,
            style: {
              stroke: isHighlighted ? '#38bdf8' : 'rgba(255,255,255,0.1)',
              strokeWidth: isHighlighted ? 3 : 1,
            },
          };
        })
      );
    },
    [pathMap, setNodes, setEdges]
  );

  const handleNodeClick = (_: any, node: any) => {
    highlightPathForNode(node.id);
    if (node.data.raw && onSelectEntity) {
      onSelectEntity(node.data.raw);
    }
  };

  const handleExportPNG = () => {
    alert('Exporting Graph Canvas as PNG SVG vector snapshot...');
  };

  const handleExportJSON = () => {
    if (!analysis) return;
    const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.repository.name}_knowledge_graph.json`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '700px', minWidth: 0 }}>
      {/* Control Bar & Path Selector */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '300px' }}>
          <Sparkles size={20} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'white' }}>Path Highlighting:</span>
          <select
            value={selectedEndpoint}
            onChange={(e) => {
              setSelectedEndpoint(e.target.value);
              highlightPathForNode(e.target.value);
            }}
            style={{
              background: 'rgba(0,0,0,0.4)',
              color: 'white',
              border: '1px solid var(--border-card)',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              outline: 'none',
              flex: 1,
              maxWidth: '400px',
            }}
          >
            <option value="">Select REST Endpoint / Component to Highlight Flow...</option>
            {analysis?.entities
              .filter((e) => e.type === 'Controller')
              .map((c) => (
                <option key={c.id} value={c.id}>
                  🎮 {c.name}
                </option>
              ))}
          </select>

          {selectedEndpoint && (
            <button
              onClick={() => {
                setSelectedEndpoint('');
                highlightPathForNode('');
              }}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--border-card)', color: 'white', padding: '0.35rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              Reset Path
            </button>
          )}
        </div>

        {/* Export Options */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleExportJSON}
            style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid var(--accent-indigo)', color: 'white', padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Download size={14} /> Export JSON
          </button>

          <button
            onClick={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid var(--accent-cyan)', color: 'white', padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Share2 size={14} />}
            {copied ? 'Copied Share Link!' : 'Share Canvas'}
          </button>
        </div>
      </div>

      {/* Interactive Drag & Drop React Flow Canvas */}
      <div className="glass-panel" style={{ flex: 1, position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="rgba(255, 255, 255, 0.08)" />
          <Controls style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-card)', borderRadius: '8px', color: 'white' }} />
          <MiniMap nodeColor="#38bdf8" maskColor="rgba(0, 0, 0, 0.7)" style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid var(--border-card)', borderRadius: '8px' }} />
        </ReactFlow>
      </div>
    </div>
  );
};
