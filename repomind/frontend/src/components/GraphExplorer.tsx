import React, { useState, useMemo } from 'react';
import { Layers, Database, Radio, Globe, Shield, Code, Search, Filter } from 'lucide-react';
import { AnalysisResult, CodeEntity, EntityType } from '../types/api';

interface GraphExplorerProps {
  analysis: AnalysisResult;
  onSelectEntity: (entity: CodeEntity) => void;
}

export const GraphExplorer: React.FC<GraphExplorerProps> = ({ analysis, onSelectEntity }) => {
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

  const filteredEntities = useMemo(() => {
    if (filterType === 'ALL') return analysis.entities;
    if (filterType === 'Controller') return controllers;
    if (filterType === 'Service') return services;
    if (filterType === 'Repository') return repos;
    if (filterType === 'API') return analysis.entities.filter((e) => e.type === 'Controller');
    return analysis.entities;
  }, [analysis, filterType, controllers, services, repos]);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Controls & Filter Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', padding: '0.5rem 0.85rem', borderRadius: '8px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter entities, methods, classes..."
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.85rem', outline: 'none', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={15} color="var(--text-muted)" />
          {['ALL', 'Controller', 'Service', 'Repository', 'Interface'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                background: filterType === type ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.05)',
                color: filterType === type ? 'white' : 'var(--text-muted)',
                border: '1px solid var(--border-card)',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Graph Layer Diagram */}
      <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '480px' }}>
        {/* Layer 1: API / Controllers */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Globe size={16} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-cyan)' }}>
              API Layer / Controllers ({controllers.length})
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.85rem' }}>
            {controllers.length > 0 ? (
              controllers.map((entity) => {
                const colors = getNodeColor(entity.type);
                const Icon = colors.icon;
                const isSelected = selectedNodeId === entity.id;

                return (
                  <div
                    key={entity.id}
                    onClick={() => {
                      setSelectedNodeId(entity.id);
                      onSelectEntity(entity);
                    }}
                    style={{
                      background: colors.bg,
                      border: `1.5px solid ${isSelected ? 'var(--accent-cyan)' : colors.border}`,
                      boxShadow: isSelected ? 'var(--shadow-cyan-glow)' : 'none',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: colors.text, background: 'rgba(0,0,0,0.3)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        {entity.type}
                      </span>
                      <Icon size={15} color={colors.text} />
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'white', marginBottom: '0.2rem' }}>{entity.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>{entity.filePath}</div>
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No controllers detected in this view.</div>
            )}
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--border-card)' }} />

        {/* Layer 2: Application / Services */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Layers size={16} color="var(--accent-indigo)" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-indigo)' }}>
              Application & Service Layer ({services.length})
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.85rem' }}>
            {services.length > 0 ? (
              services.map((entity) => {
                const colors = getNodeColor(entity.type);
                const Icon = colors.icon;
                const isSelected = selectedNodeId === entity.id;

                return (
                  <div
                    key={entity.id}
                    onClick={() => {
                      setSelectedNodeId(entity.id);
                      onSelectEntity(entity);
                    }}
                    style={{
                      background: colors.bg,
                      border: `1.5px solid ${isSelected ? 'var(--accent-indigo)' : colors.border}`,
                      boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: colors.text, background: 'rgba(0,0,0,0.3)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        {entity.type}
                      </span>
                      <Icon size={15} color={colors.text} />
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'white', marginBottom: '0.2rem' }}>{entity.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>{entity.filePath}</div>
                  </div>
                );
              })
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>No service layer components detected.</div>
            )}
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--border-card)' }} />

        {/* Layer 3: Infrastructure / Repositories & Database */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Database size={16} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-purple)' }}>
              Infrastructure, Repositories & Messaging ({repos.length + events.length})
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.85rem' }}>
            {repos.map((entity) => {
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
                    border: `1.5px solid ${colors.border}`,
                    borderRadius: '10px',
                    padding: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: colors.text, background: 'rgba(0,0,0,0.3)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      {entity.type}
                    </span>
                    <Icon size={15} color={colors.text} />
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'white', marginBottom: '0.2rem' }}>{entity.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>{entity.filePath}</div>
                </div>
              );
            })}

            {dbs.map((db, idx) => (
              <div key={idx} style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-amber)', background: 'rgba(0,0,0,0.3)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    {db.ormProvider}
                  </span>
                  <Database size={15} color="var(--accent-amber)" />
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'white', marginBottom: '0.2rem' }}>{db.tableName}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Op: {db.operation}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
