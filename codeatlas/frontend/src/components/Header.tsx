import React from 'react';
import { Network, Plus, FolderGit2, RefreshCw, Cpu } from 'lucide-react';
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
    <header className="glass-panel" style={{ padding: '0.85rem 1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '0.6rem', borderRadius: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)' }}>
          <Network size={22} color="white" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '800', background: 'linear-gradient(90deg, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              CodeAtlas
            </h1>
            <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '700' }}>
              v1.0 .NET
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Personal Engineering Knowledge Graph</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Repository Selector */}
        {repositories.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', padding: '0.4rem 0.8rem', borderRadius: '10px' }}>
            <FolderGit2 size={16} color="var(--accent-cyan)" />
            <select
              value={activeRepo?.id || ''}
              onChange={(e) => {
                const found = repositories.find((r) => r.id === e.target.value);
                if (found) onSelectRepo(found);
              }}
              style={{ background: 'transparent', color: 'var(--text-main)', border: 'none', outline: 'none', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
            >
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.id} style={{ background: '#161b26', color: '#ffffff' }}>
                  {repo.name} ({repo.branch || 'main'})
                </option>
              ))}
            </select>
          </div>
        )}

        <button onClick={onRefresh} className="btn-secondary" disabled={isLoading} title="Refresh Repositories">
          <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
          <span style={{ fontSize: '0.82rem' }}>Refresh</span>
        </button>

        <button onClick={onOpenScanModal} className="btn-primary">
          <Plus size={16} />
          <span>Connect Repository</span>
        </button>
      </div>
    </header>
  );
};
