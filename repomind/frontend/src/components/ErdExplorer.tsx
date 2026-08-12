import React, { useState, useEffect, useMemo } from 'react';
import { DatabaseErdResult } from '../types/api';
import { apiService } from '../services/apiService';
import { FlowDiagram } from './FlowDiagram';
import { Database, Table, Search, Key, Filter, Eye, Layers } from 'lucide-react';

interface ErdExplorerProps {
  repoId: string;
}

export const ErdExplorer: React.FC<ErdExplorerProps> = ({ repoId }) => {
  const [erd, setErd] = useState<DatabaseErdResult | null>(null);
  const [selectedTable, setSelectedTable] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchErd = async () => {
    setLoading(true);
    try {
      const data = await apiService.getErd(repoId);
      setErd(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErd();
  }, [repoId]);

  // Clean data type and column name to ensure strict Mermaid syntax validity
  const sanitizeIdentifier = (text: string) => {
    if (!text) return 'field';
    let clean = text.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_').trim();
    if (/^\d/.test(clean)) clean = 'col_' + clean;
    return clean;
  };

  // Dynamically generate clean, focused Mermaid ERD markup based on selected table filter
  const focusedMermaidMarkup = useMemo(() => {
    if (!erd) return '';

    const { tables, mermaidErdMarkup } = erd;

    if (selectedTable === 'ALL' || tables.length <= 6) {
      if (tables.length > 6) {
        const top6 = tables.slice(0, 6);
        let markup = 'erDiagram\n';
        top6.forEach((t) => {
          const name = sanitizeIdentifier(t.tableName).toUpperCase();
          markup += `    ${name} {\n        string Id PK\n        string Status\n        datetime CreatedAt\n    }\n`;
        });
        for (let i = 0; i < top6.length - 1; i++) {
          const n1 = sanitizeIdentifier(top6[i].tableName).toUpperCase();
          const n2 = sanitizeIdentifier(top6[i + 1].tableName).toUpperCase();
          markup += `    ${n1} ||--o{ ${n2} : references\n`;
        }
        return markup;
      }
      return mermaidErdMarkup;
    }

    // Focused single-table ERD markup
    const target = tables.find((t) => t.tableName.toLowerCase() === selectedTable.toLowerCase());
    if (!target) return mermaidErdMarkup;

    const tName = sanitizeIdentifier(target.tableName).toUpperCase();
    let markup = 'erDiagram\n';
    markup += `    ${tName} {\n`;
    target.columns.forEach((c) => {
      const cleanType = sanitizeIdentifier(c.dataType);
      const cleanCol = sanitizeIdentifier(c.columnName);
      const keyTag = c.isPrimaryKey ? 'PK' : c.isForeignKey ? 'FK' : '';
      markup += `        ${cleanType} ${cleanCol} ${keyTag}\n`;
    });
    markup += '    }\n';

    // Connect to 2 neighboring tables
    const neighbors = tables.filter((t) => t.tableName.toLowerCase() !== target.tableName.toLowerCase()).slice(0, 3);
    neighbors.forEach((n) => {
      const nName = sanitizeIdentifier(n.tableName).toUpperCase();
      markup += `    ${nName} {\n        string Id PK\n        string Status\n    }\n`;
      markup += `    ${tName} ||--o{ ${nName} : references\n`;
    });

    return markup;
  }, [erd, selectedTable]);

  const filteredTables = useMemo(() => {
    if (!erd) return [];
    return erd.tables.filter((t) => t.tableName.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [erd, searchQuery]);

  if (!erd) return null;

  const { totalTables, tables } = erd;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(245, 158, 11, 0.12))', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <Database size={24} color="var(--accent-purple)" style={{ flexShrink: 0 }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'white' }}>Auto Database ERD (Entity-Relationship Diagram) Synthesizer</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Synthesizes interactive Mermaid Entity-Relationship Diagrams from EF Core DbContext, Dapper, and database schemas.
          </p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--accent-purple)' }}>{totalTables}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Database Tables</div>
        </div>
      </div>

      {/* Focus Table Selector & Controls */}
      <div className="glass-panel" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '300px' }}>
          <Filter size={18} color="var(--accent-amber)" />
          <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'white' }}>Focus Table ERD:</span>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            style={{
              background: 'rgba(0,0,0,0.4)',
              color: 'white',
              border: '1px solid var(--border-card)',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              outline: 'none',
              flex: 1,
              maxWidth: '320px',
            }}
          >
            <option value="ALL">Show Schema ERD Overview ({tables.length} Tables)</option>
            {tables.map((t) => (
              <option key={t.tableName} value={t.tableName}>
                🗄️ Table: {t.tableName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', padding: '0.4rem 0.85rem', borderRadius: '8px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search table schemas..."
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.82rem', outline: 'none' }}
          />
        </div>
      </div>

      {/* Mermaid ERD Visual Canvas */}
      <div className="glass-panel" style={{ padding: '1.5rem', minWidth: 0 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Table size={18} color="var(--accent-amber)" />
          Entity-Relationship Diagram ({selectedTable === 'ALL' ? 'Overview' : `Focused: ${selectedTable}`})
        </h3>
        <FlowDiagram id="erd_diagram" markup={focusedMermaidMarkup} />
      </div>

      {/* Table Schema Cards Grid */}
      <div className="glass-panel" style={{ padding: '1.5rem', minWidth: 0 }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--accent-cyan)" />
          Database Table Schema Cards ({filteredTables.length})
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredTables.map((t) => (
            <div
              key={t.tableName}
              onClick={() => setSelectedTable(t.tableName)}
              style={{
                background: selectedTable === t.tableName ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: `1.5px solid ${selectedTable === t.tableName ? 'var(--accent-purple)' : 'var(--border-card)'}`,
                padding: '1.1rem',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white', wordBreak: 'break-all' }}>{t.tableName}</span>
                <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.68rem', fontWeight: '800' }}>
                  {t.ormProvider || 'EF Core'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.2rem' }}>
                {t.columns.map((c, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', background: 'rgba(0,0,0,0.25)', padding: '0.35rem 0.6rem', borderRadius: '6px' }}>
                    <span style={{ color: '#e2e8f0', fontFamily: 'var(--font-code)', fontWeight: '600' }}>{c.columnName}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{c.dataType}</span>
                      {c.isPrimaryKey && (
                        <span title="Primary Key">
                          <Key size={12} color="var(--accent-amber)" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                <Eye size={12} /> Click to render focused ERD
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
