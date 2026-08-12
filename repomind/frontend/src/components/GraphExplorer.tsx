import React, { useState, useMemo } from 'react';
import { Layers, Database, Radio, Globe, Shield, Code, Search, Filter, Sparkles, LayoutGrid } from 'lucide-react';
import { AnalysisResult, CodeEntity, EntityType } from '../types/api';
import { InteractiveCanvas } from './InteractiveCanvas';

interface GraphExplorerProps {
  analysis: AnalysisResult;
  onSelectEntity: (entity: CodeEntity) => void;
}

export const GraphExplorer: React.FC<GraphExplorerProps> = ({ analysis, onSelectEntity }) => {
  const [viewMode, setViewMode] = useState<'canvas' | 'grid'>('canvas');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Group entities by layer / type for visualization layout
  const { controllers, services, repos, apis, dbs, events, dtos } = useMemo(() => {
    const list = analysis.entities.filter((e) => {
      if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase()) && !e.fullName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    });

    return {
      controllers: list.filter((e) => e.type === 'Controller' || e.name.endsWith('Controller')),
      services: list.filter((e) => e.type === 'Service' || e.type === 'Interface' || e.name.endsWith('Service')),
      repos: list.filter((e) => e.type === 'Repository' || e.name.endsWith('Repository')),
      apis: analysis.apis,
      dbs: analysis.databases,
      events: analysis.events,
      dtos: list.filter((e) => e.type === 'DTO' || e.name.endsWith('Dto') || e.type === 'Model'),
    };
  }, [analysis, searchQuery]);

  const getNodeColor = (type: EntityType | string) => {
    switch (type) {
      case 'Controller': return { bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8', text: '#7dd3fc', icon: Globe };
      case 'Service': return { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366f1', text: '#a5b4fc', icon: Layers };
      case 'Repository': return { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', text: '#c084fc', icon: Shield };
      case 'Interface': return { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#6ee7b7', icon: Code };
      case 'Consumer': return { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#fcd34d', icon: Radio };
      default: return { bg: 'rgba(255, 255, 255, 0.08)', border: 'rgba(255,255,255,0.2)', text: '#e5e7eb', icon: Code };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
      {/* Top Header Mode Toggle */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setViewMode('canvas')}
            style={{
              background: viewMode === 'canvas' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: viewMode === 'canvas' ? 'white' : 'var(--text-muted)',
              border: viewMode === 'canvas' ? '1px solid var(--accent-cyan)' : '1px solid transparent',
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Sparkles size={16} color="var(--accent-cyan)" />
            Interactive Drag & Drop Canvas (React Flow)
          </button>

          <button
            onClick={() => setViewMode('grid')}
            style={{
              background: viewMode === 'grid' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: viewMode === 'grid' ? 'white' : 'var(--text-muted)',
              border: viewMode === 'grid' ? '1px solid var(--accent-indigo)' : '1px solid transparent',
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <LayoutGrid size={16} color="var(--accent-indigo)" />
            Layer Grid View
          </button>
        </div>

        {viewMode === 'grid' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '350px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', padding: '0.4rem 0.85rem', borderRadius: '8px' }}>
            <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter entities..."
              style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.85rem', outline: 'none', width: '100%' }}
            />
          </div>
        )}
      </div>

      {/* Render View Mode */}
      {viewMode === 'canvas' ? (
        <InteractiveCanvas analysis={analysis} onSelectEntity={onSelectEntity} />
      ) : (
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '480px', minWidth: 0 }}>
          {/* Layer 1: API / Controllers */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Globe size={16} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-cyan)' }}>
                API Layer / Controllers ({controllers.length})
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
              {controllers.map((entity) => {
                const colors = getNodeColor(entity.type);
                const Icon = colors.icon;
                return (
                  <div
                    key={entity.id}
                    onClick={() => {
                      setSelectedNodeId(entity.id);
                      onSelectEntity(entity);
                    }}
                    style={{
                      background: colors.bg,
                      border: `1.5px solid ${selectedNodeId === entity.id ? 'var(--accent-cyan)' : colors.border}`,
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: colors.text, background: 'rgba(0,0,0,0.3)', padding: '0.15rem 0.45rem', borderRadius: '4px', flexShrink: 0 }}>
                        {entity.type}
                      </span>
                      <Icon size={15} color={colors.text} style={{ flexShrink: 0 }} />
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'white', wordBreak: 'break-all' }}>{entity.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', wordBreak: 'break-all' }}>{entity.filePath}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--border-card)' }} />

          {/* Layer 2: Application / Services */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Layers size={16} color="var(--accent-indigo)" style={{ flexShrink: 0 }} />
              <h3 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-indigo)' }}>
                Application & Service Layer ({services.length})
              </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
              {services.map((entity) => {
                const colors = getNodeColor(entity.type);
                const Icon = colors.icon;
                return (
                  <div
                    key={entity.id}
                    onClick={() => {
                      setSelectedNodeId(entity.id);
                      onSelectEntity(entity);
                    }}
                    style={{
                      background: colors.bg,
                      border: `1.5px solid ${selectedNodeId === entity.id ? 'var(--accent-indigo)' : colors.border}`,
                      borderRadius: '10px',
                      padding: '0.85rem 1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: colors.text, background: 'rgba(0,0,0,0.3)', padding: '0.15rem 0.45rem', borderRadius: '4px', flexShrink: 0 }}>
                        {entity.type}
                      </span>
                      <Icon size={15} color={colors.text} style={{ flexShrink: 0 }} />
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'white', wordBreak: 'break-all' }}>{entity.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', wordBreak: 'break-all' }}>{entity.filePath}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
