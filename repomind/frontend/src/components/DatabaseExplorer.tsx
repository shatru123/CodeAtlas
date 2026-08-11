import React, { useState } from 'react';
import { Database, Search, Table, HardDrive, ArrowRight, FileCode } from 'lucide-react';
import { DatabaseReference } from '../types/api';

interface DatabaseExplorerProps {
  databases: DatabaseReference[];
}

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({ databases }) => {
  const [search, setSearch] = useState('');

  const filteredDbs = databases.filter((db) => {
    return (
      db.tableName.toLowerCase().includes(search.toLowerCase()) ||
      db.ormProvider.toLowerCase().includes(search.toLowerCase()) ||
      db.sourceEntity.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', padding: '0.5rem 0.85rem', borderRadius: '8px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search database tables, ORM providers (EF Core, Dapper), or queries..."
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.85rem', outline: 'none', width: '100%' }}
          />
        </div>
      </div>

      {/* Database Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {filteredDbs.length > 0 ? (
          filteredDbs.map((db) => (
            <div key={db.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {db.ormProvider}
                  </span>
                  <Database size={18} color="var(--accent-amber)" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', minWidth: 0 }}>
                  <Table size={18} color="white" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '1.05rem', fontWeight: '700', color: 'white', wordBreak: 'break-all' }}>{db.tableName}</span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>Operation:</span>
                  <span style={{ fontWeight: '600', color: db.operation === 'WRITE' ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                    {db.operation}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', gap: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', wordBreak: 'break-all', minWidth: 0 }}>
                  <FileCode size={13} style={{ flexShrink: 0 }} />
                  {db.filePath}:{db.lineNumber}
                </span>
                <ArrowRight size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <HardDrive size={32} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
            <p>No database references or ORM mappings found.</p>
          </div>
        )}
      </div>
    </div>
  );
};
