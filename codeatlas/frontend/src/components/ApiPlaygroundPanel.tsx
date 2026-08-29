import React, { useState } from 'react';
import { Play, Send, RefreshCw, Code2, Globe, Clock, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import { MetricTooltip } from './MetricTooltip';
import { ContextualHelpBox } from './ContextualHelpBox';

interface ApiPlaygroundPanelProps {
  repoId: string;
}

export const ApiPlaygroundPanel: React.FC<ApiPlaygroundPanelProps> = ({ repoId }) => {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [url, setUrl] = useState('/api/repositories');
  const [payloadJson, setPayloadJson] = useState('{\n  "path": "/Users/shatrughnaambhore/Shatru/Learning/Projects/CodeAtlas"\n}');
  const [response, setResponse] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExecuting(true);
    try {
      const res = await apiService.executeApiPlayground({
        method,
        url,
        payloadJson: method !== 'GET' ? payloadJson : undefined,
        headers: { 'Content-Type': 'application/json' }
      });
      setResponse(res);
    } catch {
      // Fallback
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <ContextualHelpBox
        title="What is Live Executable API Playground?"
        description="Live API Playground allows developers to test and execute REST API requests directly from within CodeAtlas without switching to external tools like Postman or Insomnia."
      />

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(14, 116, 144, 0.5))', border: '1.5px solid var(--accent-cyan)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(6,182,212,0.4)' }}>
            <Globe size={24} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>
              Live Executable REST API Playground (<MetricTooltip term="In-Browser HTTP Client" explanation="Execute REST APIs directly inside CodeAtlas with auto-filled mock payloads." />)
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Test REST endpoints, send synthetic JSON payloads, and view real-time HTTP response headers & latency.
            </p>
          </div>
        </div>
      </div>

      {/* HTTP Request Builder Form */}
      <form onSubmit={handleExecute} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as any)}
            style={{ background: 'rgba(15,23,42,0.9)', color: 'var(--accent-cyan)', border: '1px solid var(--accent-cyan)', padding: '0.5rem 0.85rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', outline: 'none' }}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/api/repositories"
            style={{ flex: 1, background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-card)', padding: '0.5rem 0.85rem', borderRadius: '8px', color: 'white', fontFamily: 'var(--font-code)', fontSize: '0.85rem', outline: 'none' }}
          />
          <button type="submit" disabled={isExecuting} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
            {isExecuting ? <RefreshCw size={15} className="spin" /> : <Send size={15} />}
            <span>Send Request</span>
          </button>
        </div>

        {method !== 'GET' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700' }}>JSON Request Payload:</label>
            <textarea
              rows={4}
              value={payloadJson}
              onChange={(e) => setPayloadJson(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-card)', padding: '0.75rem', borderRadius: '8px', color: '#38bdf8', fontSize: '0.82rem', fontFamily: 'var(--font-code)', outline: 'none' }}
            />
          </div>
        )}
      </form>

      {/* Response Box */}
      {response && (
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ background: response.statusCode === 200 ? 'rgba(74,222,128,0.2)' : 'rgba(244,63,94,0.2)', color: response.statusCode === 200 ? 'var(--accent-emerald)' : 'var(--accent-rose)', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800' }}>
                HTTP {response.statusCode} {response.statusText}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={14} /> Latency: {response.durationMs}ms
            </span>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700' }}>Response Body JSON:</div>
          <pre style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-card)', padding: '1rem', borderRadius: '10px', color: '#38bdf8', fontSize: '0.82rem', fontFamily: 'var(--font-code)', maxHeight: '360px', overflowY: 'auto' }}>
            {response.responseBodyJson}
          </pre>
        </div>
      )}
    </div>
  );
};
