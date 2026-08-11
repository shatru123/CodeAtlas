import React, { useState } from 'react';
import { Globe, Search, Code, CheckCircle, FileCode } from 'lucide-react';
import { ApiDefinition } from '../types/api';

interface ApiExplorerProps {
  apis: ApiDefinition[];
}

export const ApiExplorer: React.FC<ApiExplorerProps> = ({ apis }) => {
  const [search, setSearch] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');

  const filteredApis = apis.filter((api) => {
    const matchesSearch =
      api.route.toLowerCase().includes(search.toLowerCase()) ||
      api.controllerName.toLowerCase().includes(search.toLowerCase()) ||
      api.actionName.toLowerCase().includes(search.toLowerCase());

    const matchesMethod = selectedMethod === 'ALL' || api.httpMethod.toUpperCase() === selectedMethod;
    return matchesSearch && matchesMethod;
  });

  const getBadgeClass = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'badge-get';
      case 'POST': return 'badge-post';
      case 'PUT': return 'badge-put';
      case 'DELETE': return 'badge-delete';
      default: return 'badge-get';
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
            placeholder="Search API routes, controllers, or endpoints..."
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.85rem', outline: 'none', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map((method) => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              style={{
                background: selectedMethod === method ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.05)',
                color: selectedMethod === method ? 'white' : 'var(--text-muted)',
                border: '1px solid var(--border-card)',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {/* APIs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredApis.length > 0 ? (
          filteredApis.map((api) => (
            <div key={api.id} className="glass-panel" style={{ padding: '1.15rem 1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className={`badge ${getBadgeClass(api.httpMethod)}`} style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
                  {api.httpMethod}
                </span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'white', fontFamily: 'var(--font-code)', marginBottom: '0.2rem', wordBreak: 'break-all' }}>
                    {api.route}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-cyan)', wordBreak: 'break-all' }}>
                      <Globe size={14} style={{ flexShrink: 0 }} />
                      {api.controllerName}.{api.actionName}()
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', wordBreak: 'break-all' }}>
                      <FileCode size={14} style={{ flexShrink: 0 }} />
                      {api.filePath}:{api.lineNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
                <CheckCircle size={14} color="var(--accent-emerald)" />
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent-emerald)' }}>REST Endpoint</span>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Globe size={32} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
            <p>No REST API endpoints matched your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
