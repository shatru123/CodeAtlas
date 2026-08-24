import React from 'react';
import { Plus, FolderGit2, RefreshCw, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { RepositoryInfo } from '../types/api';

interface HeaderProps {
  repositories: RepositoryInfo[];
  activeRepo: RepositoryInfo | null;
  onSelectRepo: (repo: RepositoryInfo) => void;
  onOpenScanModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  activeTabLabel: string;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  repositories,
  activeRepo,
  onSelectRepo,
  onOpenScanModal,
  onRefresh,
  isLoading,
  activeTabLabel,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  return (
    <header
      className="glass-panel"
      style={{
        padding: '0.85rem 1.5rem',
        borderRadius: '0',
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Breadcrumbs & Mobile Sidebar Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-main)',
            padding: '0.4rem',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          <span>CodeAtlas</span>
          <span>/</span>
          <span style={{ color: 'var(--accent-cyan)' }}>{activeRepo?.name || 'Workspace'}</span>
          <span>/</span>
          <span style={{ color: 'white', fontWeight: 700 }}>{activeTabLabel}</span>
        </div>
      </div>

      {/* Right: Actions & Repository Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        {repositories.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-card)',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
            }}
          >
            <FolderGit2 size={16} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
            <select
              value={activeRepo?.id || ''}
              onChange={(e) => {
                const found = repositories.find((r) => r.id === e.target.value);
                if (found) onSelectRepo(found);
              }}
              style={{
                background: 'transparent',
                color: 'var(--text-main)',
                border: 'none',
                outline: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                maxWidth: '200px',
              }}
            >
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.id} style={{ background: '#111827', color: '#ffffff' }}>
                  {repo.name} ({repo.branch || 'main'})
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={onRefresh}
          className="btn-secondary"
          disabled={isLoading}
          title="Refresh Repositories"
          style={{ fontSize: '0.825rem' }}
        >
          <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>

        <button onClick={onOpenScanModal} className="btn-primary" style={{ fontSize: '0.825rem' }}>
          <Plus size={16} />
          <span>Connect Repo</span>
        </button>
      </div>
    </header>
  );
};
