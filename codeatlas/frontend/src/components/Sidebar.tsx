import React from 'react';
import {
  Sparkles,
  Bot,
  Network,
  PlayCircle,
  Zap,
  Globe,
  Database,
  Radio,
  Package,
  Shield,
  ShieldAlert,
  Share2,
  GitCompare,
  Table,
  Box,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { AnalysisResult, ArchitectureSummary } from '../types/api';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  analysis: AnalysisResult | null;
  repositoriesCount: number;
  architecture?: ArchitectureSummary | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  width: number;
  onWidthChange: (width: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  analysis,
  repositoriesCount,
  architecture,
  isCollapsed,
  onToggleCollapse,
  width,
  onWidthChange,
}) => {
  const categories = [
    {
      title: '🤖 AI & Execution Suite',
      items: [
        { id: 'agentic', label: 'Agentic AI Platform', icon: Sparkles, count: '✨ AI Engine' },
        { id: 'ai', label: 'AI Code Assistant', icon: Bot, count: '🤖 RAG' },
        { id: 'runner', label: 'Code Runner', icon: PlayCircle, count: '▶ Terminal' },
        { id: 'flows', label: 'Functional Flows', icon: Zap, count: analysis?.flows?.length || 0 },
      ],
    },
    {
      title: '🔍 Topology & Graph',
      items: [
        { id: 'graph', label: 'Knowledge Graph', icon: Network, count: analysis?.entities?.length || 0 },
        { id: 'architecture', label: 'Architecture & Rules', icon: Shield, count: architecture ? (architecture.violations.length > 0 ? `${architecture.violations.length} Alerts` : 'Clean') : '4 Rules' },
        { id: 'mesh', label: 'Workspace Mesh', icon: Share2, count: `${repositoriesCount} Repos` },
        { id: 'infra', label: 'Infra Topology', icon: Box, count: 'K8s/Docker' },
      ],
    },
    {
      title: '🛡️ Quality & Security',
      items: [
        { id: 'impact', label: 'Blast Radius Impact', icon: Zap, count: 'Impact' },
        { id: 'security', label: 'Security & CVE Audit', icon: ShieldAlert, count: analysis?.securityAudit ? `${analysis.securityAudit.securityScore}/100` : 'Audit' },
        { id: 'diff', label: 'Branch Diff Delta', icon: GitCompare, count: 'Delta' },
        { id: 'erd', label: 'Database ERD', icon: Table, count: 'ERD' },
      ],
    },
    {
      title: '📚 Catalogs & Docs',
      items: [
        { id: 'apis', label: 'REST APIs Catalog', icon: Globe, count: analysis?.apis?.length || 0 },
        { id: 'databases', label: 'Database & ORM', icon: Database, count: analysis?.databases?.length || 0 },
        { id: 'events', label: 'Messaging Events', icon: Radio, count: analysis?.events?.length || 0 },
        { id: 'packages', label: 'Packages & Libraries', icon: Package, count: analysis?.packages?.length || 0 },
        { id: 'handbook', label: 'Handbook Exporter', icon: BookOpen, count: 'Docs' },
      ],
    },
  ];

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isCollapsed) return;
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(180, Math.min(500, startWidth + (moveEvent.clientX - startX)));
      onWidthChange(newWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <aside
      className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{ width: isCollapsed ? '72px' : `${width}px` }}
    >
      {/* Sidebar Header Brand */}
      <div
        style={{
          padding: '1.25rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-card)',
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
                padding: '0.45rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Network size={18} color="white" />
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>CodeAtlas</span>
              <span style={{ fontSize: '0.65rem', background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px', fontWeight: 700 }}>v2.5</span>
            </div>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-muted)',
            borderRadius: '6px',
            padding: '0.35rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div style={{ padding: '0.5rem 0', flex: 1, overflowY: 'auto' }}>
        {categories.map((cat) => (
          <div key={cat.title}>
            {!isCollapsed && <div className="sidebar-section-title">{cat.title}</div>}
            {cat.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={18} color={isActive ? 'var(--accent-indigo)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                  {!isCollapsed && <span>{item.label}</span>}
                  {!isCollapsed && <span className="sidebar-nav-badge">{item.count}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer Repository Context */}
      {!isCollapsed && analysis && (
        <div
          style={{
            padding: '1rem 1.15rem',
            borderTop: '1px solid var(--border-card)',
            background: 'rgba(0,0,0,0.2)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ fontWeight: 700, color: 'white', marginBottom: '2px', wordBreak: 'break-all' }}>
            {analysis.repository.name}
          </div>
          <div style={{ color: 'var(--accent-cyan)', fontSize: '0.72rem' }}>
            Branch: {analysis.repository.branch || 'main'}
          </div>
        </div>
      )}

      {/* Draggable Resizer Handle Bar */}
      {!isCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '6px',
            cursor: 'col-resize',
            zIndex: 60,
            background: 'transparent',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.5)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          title="Drag right/left to resize sidebar"
        />
      )}
    </aside>
  );
};
