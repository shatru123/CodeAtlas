import React, { useEffect, useState } from 'react';
import { WorkspaceMeshSummary } from '../types/api';
import { apiService } from '../services/apiService';
import { Network, Server, ArrowRight, Radio, Cpu, RefreshCw } from 'lucide-react';

export const MeshExplorer: React.FC = () => {
  const [mesh, setMesh] = useState<WorkspaceMeshSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMesh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getWorkspaceMesh();
      setMesh(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load workspace mesh graph');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMesh();
  }, []);

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ marginBottom: '1rem', color: 'var(--accent-cyan)' }} />
        <p>Synthesizing Multi-Repository Cross-Service Dependency Mesh...</p>
      </div>
    );
  }

  if (error || !mesh) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', color: 'var(--accent-rose)' }}>
        <p>Failed to load workspace mesh: {error}</p>
      </div>
    );
  }

  const { totalRepositories, totalCrossRepoDependencies, dependencies, repositories } = mesh;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
      {/* Overview Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(168, 85, 247, 0.12))', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <Network size={24} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'white' }}>Multi-Repository Cross-Service Mesh Graph</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Cross-service REST HTTP API dependencies and asynchronous messaging event streams across all workspace repositories.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{totalRepositories}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Indexed Repositories</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-purple)' }}>{totalCrossRepoDependencies}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cross-Repo Connections</div>
          </div>
        </div>
      </div>

      {/* Connected Repositories Mesh Grid */}
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {repositories.map((repo) => (
          <div key={repo.id} className="glass-panel" style={{ padding: '0.85rem 1.2rem', minWidth: '220px', display: 'flex', alignItems: 'center', gap: '0.65rem', border: '1px solid var(--border-card)' }}>
            <Server size={18} color="var(--accent-cyan)" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{repo.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Branch: {repo.branch || 'main'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cross-Service Dependencies List */}
      <div className="glass-panel" style={{ padding: '1.5rem', minWidth: 0 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={18} color="var(--accent-purple)" />
          Cross-Repository Dependency Links ({dependencies.length})
        </h3>

        {dependencies.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Radio size={36} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
            <p>Scan multiple repositories (e.g. OrderService & PaymentApi) to detect cross-service REST HTTP calls and messaging event streams.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {dependencies.map((dep) => (
              <div key={dep.id} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-card)', padding: '1rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
                  <div style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.5rem 0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Source Repo</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'white' }}>{dep.sourceRepoName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)' }}>{dep.sourceComponent}</div>
                  </div>

                  <ArrowRight size={20} color="var(--accent-indigo)" style={{ flexShrink: 0 }} />

                  <div style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '0.5rem 0.85rem', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Repo</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: '800', color: 'white' }}>{dep.targetRepoName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', fontFamily: 'var(--font-code)' }}>{dep.targetComponent}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                  <span style={{ background: dep.dependencyType === 'REST_HTTP' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: dep.dependencyType === 'REST_HTTP' ? 'var(--accent-cyan)' : 'var(--accent-emerald)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '800' }}>
                    {dep.dependencyType} ({dep.protocol})
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dep.context}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
