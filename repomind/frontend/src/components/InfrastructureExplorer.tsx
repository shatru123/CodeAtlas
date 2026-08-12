import React, { useState, useEffect } from 'react';
import { InfrastructureTopology } from '../types/api';
import { apiService } from '../services/apiService';
import { Box, Server, Shield, FileCode, Layers, RefreshCw } from 'lucide-react';

interface InfrastructureExplorerProps {
  repoId: string;
}

export const InfrastructureExplorer: React.FC<InfrastructureExplorerProps> = ({ repoId }) => {
  const [infra, setInfra] = useState<InfrastructureTopology | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInfra = async () => {
    setLoading(true);
    try {
      const data = await apiService.getInfrastructure(repoId);
      setInfra(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfra();
  }, [repoId]);

  if (!infra) return null;

  const { dockerfilesCount, k8sManifestsCount, containerServices } = infra;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(16, 185, 129, 0.12))', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <Box size={24} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'white' }}>Docker & Kubernetes Infrastructure Topology</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Parses Dockerfiles, docker-compose, and K8s manifests to map container services and exposed ports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{dockerfilesCount}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Dockerfiles</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>{k8sManifestsCount}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>K8s Manifests</div>
          </div>
        </div>
      </div>

      {/* Container Services Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {containerServices.map((svc, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white' }}>{svc.serviceName}</span>
              <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: 'var(--accent-cyan)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '800' }}>CONTAINER</span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Base Image: <strong style={{ color: 'var(--accent-purple)', fontFamily: 'var(--font-code)' }}>{svc.image}</strong>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Exposed Ports: {svc.ports.map((p, i) => (
                <span key={i} style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', marginLeft: '0.3rem', fontFamily: 'var(--font-code)' }}>
                  :{p}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.73rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)', marginTop: '0.2rem' }}>
              <FileCode size={13} />
              <span>{svc.sourceFile}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
