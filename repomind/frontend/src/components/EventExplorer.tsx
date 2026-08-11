import React from 'react';
import { Radio, ArrowRight, MessageSquare, ShieldCheck, FileCode } from 'lucide-react';
import { EventDefinition } from '../types/api';

interface EventExplorerProps {
  events: EventDefinition[];
}

export const EventExplorer: React.FC<EventExplorerProps> = ({ events }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {events.length > 0 ? (
          events.map((ev) => (
            <div key={ev.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{
                    background: ev.role === 'Publisher' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: ev.role === 'Publisher' ? 'var(--accent-purple)' : 'var(--accent-emerald)',
                    border: `1px solid ${ev.role === 'Publisher' ? 'rgba(168, 85, 247, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    {ev.role}
                  </span>
                  <Radio size={18} color="var(--accent-purple)" />
                </div>

                <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'white', marginBottom: '0.4rem', fontFamily: 'var(--font-code)' }}>
                  {ev.eventName}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                  Broker: <span style={{ fontWeight: '600', color: 'var(--accent-cyan)' }}>{ev.broker}</span>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border-card)', fontSize: '0.78rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-dim)', display: 'block', fontSize: '0.7rem' }}>Handler / Sender:</span>
                  <span style={{ fontWeight: '600' }}>{ev.handlerName}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <FileCode size={13} />
                  {ev.filePath}:{ev.lineNumber}
                </span>
                <ArrowRight size={13} color="var(--text-muted)" />
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={32} color="var(--text-dim)" style={{ marginBottom: '0.5rem' }} />
            <p>No message broker events (MassTransit / RabbitMQ / Kafka) detected in this repository.</p>
          </div>
        )}
      </div>
    </div>
  );
};
