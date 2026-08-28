import React, { useState, useEffect } from 'react';
import { Share2, Box, ArrowRight, RefreshCw, Shield, Globe, Layers } from 'lucide-react';
import { apiService } from '../services/apiService';

interface MultiRepoWorkspacePanelProps {
  repoId: string;
}

export const MultiRepoWorkspacePanel: React.FC<MultiRepoWorkspacePanelProps> = ({ repoId }) => {
  const [topology, setTopology] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCrossRepo();
  }, [repoId]);

  const fetchCrossRepo = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getCrossRepoTopology();
      setTopology(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-cyan)' }} />
        <div>Building Multi-Repository Cross-Service Topology Map...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(14, 116, 144, 0.5))', border: '1.5px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)' }}>
              <Share2 size={26} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>Multi-Repository Cross-Service Workspace Explorer</h2>
                <span style={{ background: 'rgba(6, 182, 212, 0.18)', color: 'var(--accent-cyan)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                  Cross-Repo Graph Active
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Visualizes cross-service API dependencies, gRPC protocols, and multi-repo Blast Radius impact across microservices.
              </p>
            </div>
          </div>

          <button onClick={fetchCrossRepo} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <RefreshCw size={15} /> Refresh Topology
          </button>
        </div>
      </div>

      {/* Microservice Topology Flow Diagram */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--accent-cyan)" /> Microservices Architecture & Protocol Flow Map
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {topology?.services?.map((service: any, idx: number) => (
            <React.Fragment key={idx}>
              <div style={{ background: 'rgba(0,0,0,0.4)', border: '1.5px solid var(--accent-indigo)', borderRadius: '12px', padding: '1.1rem', minWidth: '210px', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Box size={18} color="var(--accent-indigo)" />
                  <span style={{ fontWeight: '800', color: 'white', fontSize: '0.95rem' }}>{service.name}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)' }}>{service.language}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{service.entitiesCount} Entities | {service.apisCount} REST APIs</div>
              </div>

              {idx < topology.services.length - 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--accent-cyan)', fontWeight: '700' }}>
                    {topology.connections[idx]?.protocol || 'HTTP'}
                  </span>
                  <ArrowRight size={20} color="var(--accent-cyan)" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
