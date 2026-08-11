import React, { useState } from 'react';
import { Package, Search, ExternalLink, FileCode, CheckCircle } from 'lucide-react';
import { PackageDependency } from '../types/api';

interface PackageExplorerProps {
  packages: PackageDependency[];
}

export const PackageExplorer: React.FC<PackageExplorerProps> = ({ packages }) => {
  const [search, setSearch] = useState('');
  const [selectedEcosystem, setSelectedEcosystem] = useState<string>('ALL');

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.packageName.toLowerCase().includes(search.toLowerCase()) ||
      pkg.version.toLowerCase().includes(search.toLowerCase()) ||
      pkg.filePath.toLowerCase().includes(search.toLowerCase());

    const matchesEco = selectedEcosystem === 'ALL' || pkg.ecosystem.toUpperCase() === selectedEcosystem;
    return matchesSearch && matchesEco;
  });

  const getEcoBadge = (eco: string) => {
    switch (eco.toUpperCase()) {
      case 'NUGET': return { bg: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)', border: 'rgba(99, 102, 241, 0.3)' };
      case 'NPM': return { bg: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', border: 'rgba(244, 63, 94, 0.3)' };
      case 'PYPI': return { bg: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', border: 'rgba(56, 189, 248, 0.3)' };
      default: return { bg: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)', border: 'rgba(168, 85, 247, 0.3)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Controls Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', padding: '0.5rem 0.85rem', borderRadius: '8px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search external packages, versions, or files..."
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.85rem', outline: 'none', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {['ALL', 'NUGET', 'NPM', 'PYPI'].map((eco) => (
            <button
              key={eco}
              onClick={() => setSelectedEcosystem(eco)}
              style={{
                background: selectedEcosystem === eco ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.05)',
                color: selectedEcosystem === eco ? 'white' : 'var(--text-muted)',
                border: '1px solid var(--border-card)',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {eco}
            </button>
          ))}
        </div>
      </div>

      {/* Package Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {filteredPackages.length > 0 ? (
          filteredPackages.map((pkg) => {
            const badge = getEcoBadge(pkg.ecosystem);
            return (
              <div key={pkg.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                      {pkg.ecosystem}
                    </span>
                    <Package size={18} color={badge.color} />
                  </div>

                  <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'white', marginBottom: '0.3rem', fontFamily: 'var(--font-code)' }}>
                    {pkg.packageName}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                    Version: <span style={{ fontWeight: '700', color: 'var(--accent-emerald)', fontFamily: 'var(--font-code)' }}>{pkg.version}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FileCode size={13} />
                    {pkg.filePath}
                  </span>
                  <CheckCircle size={13} color="var(--accent-emerald)" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={32} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
            <p>No package dependencies matched your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
