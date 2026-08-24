import React from 'react';
import { X, Code, FileCode, Layers, ArrowUpRight, ArrowDownLeft, Shield } from 'lucide-react';
import { CodeEntity, CodeRelationship } from '../types/api';

interface EntityDetailModalProps {
  entity: CodeEntity | null;
  relationships: CodeRelationship[];
  onClose: () => void;
}

export const EntityDetailModal: React.FC<EntityDetailModalProps> = ({ entity, relationships, onClose }) => {
  if (!entity) return null;

  const outboundRels = relationships.filter((r) => r.sourceFullName === entity.fullName || r.sourceEntityId === entity.id);
  const inboundRels = relationships.filter((r) => r.targetFullName === entity.fullName || r.targetFullName === entity.name || r.targetEntityId === entity.id);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'flex-end' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', height: '100vh', borderRadius: 0, borderRight: 'none', borderTop: 'none', borderBottom: 'none', padding: '1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="badge badge-get" style={{ fontSize: '0.8rem' }}>
            {entity.type}
          </span>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white', marginBottom: '0.25rem' }}>{entity.name}</h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>{entity.fullName}</div>
        </div>

        {/* File & Line Number */}
        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', padding: '0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.82rem' }}>
          <FileCode size={18} color="var(--accent-cyan)" />
          <div>
            <div style={{ color: 'white', fontWeight: '600', fontFamily: 'var(--font-code)' }}>{entity.filePath}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>Lines {entity.startLine} to {entity.endLine}</div>
          </div>
        </div>

        {/* Doc Comment if present */}
        {entity.docComment && (
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.85rem', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-indigo)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>XML Documentation</div>
            <div style={{ fontSize: '0.82rem', color: '#c7d2fe', fontFamily: 'var(--font-code)', whiteSpace: 'pre-wrap' }}>{entity.docComment}</div>
          </div>
        )}

        {/* Attributes */}
        {entity.attributes.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Attributes</h4>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {entity.attributes.map((attr, idx) => (
                <span key={idx} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-card)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)' }}>
                  [{attr}]
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dependencies (Outbound Rels) */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowUpRight size={15} color="var(--accent-indigo)" />
            Outbound Dependencies ({outboundRels.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {outboundRels.map((rel) => (
              <div key={rel.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-card)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '600', color: 'white' }}>{rel.targetFullName}</span>
                <span style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-indigo)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700' }}>
                  {rel.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dependents (Inbound Rels) */}
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ArrowDownLeft size={15} color="var(--accent-purple)" />
            Inbound Dependents ({inboundRels.length})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {inboundRels.map((rel) => (
              <div key={rel.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-card)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '600', color: 'white' }}>{rel.sourceFullName}</span>
                <span style={{ fontSize: '0.7rem', background: 'rgba(168, 85, 247, 0.2)', color: 'var(--accent-purple)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700' }}>
                  {rel.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
