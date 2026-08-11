import React, { useState } from 'react';
import { X, Folder, Github, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';
import { AnalysisResult } from '../types/api';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (result: AnalysisResult) => void;
}

export const ScanModal: React.FC<ScanModalProps> = ({ isOpen, onClose, onScanComplete }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'github'>('local');
  const [localPath, setLocalPath] = useState('~/Shatru/Learning/Projects/CodeAtlas');
  const [githubUrl, setGithubUrl] = useState('https://github.com/shatru123/CodeAtlas.git');
  const [branch, setBranch] = useState('main');
  const [accessToken, setAccessToken] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);
    setError(null);

    try {
      let result: AnalysisResult;
      if (activeTab === 'local') {
        result = await apiService.scanLocalRepository({ path: localPath });
      } else {
        result = await apiService.scanGitHubRepository({
          url: githubUrl,
          branch: branch || undefined,
          accessToken: accessToken || undefined,
        });
      }
      onScanComplete(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Scan failed. Check path or git URL.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '1.75rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={20} color="var(--accent-purple)" />
          Connect & Scan Repository
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          RepoMind will scan the codebase, build AST entities, APIs, DB flows, and knowledge graph edges.
        </p>

        {/* Source Switcher Tabs */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'local' ? 'var(--accent-indigo)' : 'transparent',
              color: activeTab === 'local' ? 'white' : 'var(--text-muted)',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Folder size={15} />
            Local Directory
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('github')}
            style={{
              flex: 1,
              padding: '0.55rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'github' ? 'var(--accent-indigo)' : 'transparent',
              color: activeTab === 'github' ? 'white' : 'var(--text-muted)',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <Github size={15} />
            GitHub Repository
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fecdd3', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} color="var(--accent-rose)" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {activeTab === 'local' ? (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                Local Folder Path (Supports ~ expansion)
              </label>
              <input
                type="text"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                placeholder="e.g. ~/Projects/OrderService or /Users/username/Projects/CodeAtlas"
                style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', padding: '0.65rem 0.85rem', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                required
              />
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                  GitHub Repository URL
                </label>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/owner/repository.git"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', padding: '0.65rem 0.85rem', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>Branch</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', padding: '0.65rem 0.85rem', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>PAT Token (Optional)</label>
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="ghp_xxxx (Private repos)"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', padding: '0.65rem 0.85rem', borderRadius: '8px', color: 'white', fontSize: '0.85rem', outline: 'none' }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Quick Presets */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Quick Presets:</span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => { setActiveTab('local'); setLocalPath('~/Shatru/Learning/Projects/CodeAtlas'); }}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-card)', color: 'var(--accent-cyan)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                Local: CodeAtlas
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('github'); setGithubUrl('https://github.com/shatru123/CodeAtlas.git'); setBranch('main'); }}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-card)', color: 'var(--accent-purple)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
              >
                GitHub: CodeAtlas
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isScanning}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isScanning}>
              {isScanning ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Analyzing AST...</span>
                </>
              ) : (
                <span>Start Deep Scan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
