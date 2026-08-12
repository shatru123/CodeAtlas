import React from 'react';
import { Network, Plus, FolderGit2, RefreshCw } from 'lucide-react';
import { RepositoryInfo } from '../types/api';

interface HeaderProps {
  repositories: RepositoryInfo[];
  activeRepo: RepositoryInfo | null;
  onSelectRepo: (repo: RepositoryInfo) => void;
  onOpenScanModal: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  repositories,
  activeRepo,
  onSelectRepo,
  onOpenScanModal,
  onRefresh,
  isLoading,
}) => {
  return (
    <header className="glass-panel" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '0.55rem', borderRadius: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)', flexShrink: 0 }}>
          <Network size={20} color="white" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', background: 'linear-gradient(90deg, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              CodeAtlas
            </h1>
            <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.1rem 0.45rem', borderRadius: '1rem', fontSize: '0.65rem', fontWeight: '700' }}>
              v2.5
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Autonomous Codebase Knowledge Graph</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', maxWidth: '100%' }}>
        {/* Repository Selector */}
        {repositories.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', padding: '0.35rem 0.65rem', borderRadius: '8px', maxWidth: '100%', overflow: 'hidden' }}>
            <FolderGit2 size={15} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
            <select
              value={activeRepo?.id || ''}
              onChange={(e) => {
                const found = repositories.find((r) => r.id === e.target.value);
                if (found) onSelectRepo(found);
              }}
              style={{ background: 'transparent', color: 'var(--text-main)', border: 'none', outline: 'none', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', maxWidth: '180px' }}
            >
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.id} style={{ background: '#161b26', color: '#ffffff' }}>
                  {repo.name} ({repo.branch || 'main'})
                </option>
              ))}
            </select>
          </div>
        )}

        <button onClick={onRefresh} className="btn-secondary" disabled={isLoading} title="Refresh Repositories" style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}>
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>

        <button onClick={onOpenScanModal} className="btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
          <Plus size={15} />
          <span>Connect Repo</span>
        </button>
      </div>
    </header>
  );
};
