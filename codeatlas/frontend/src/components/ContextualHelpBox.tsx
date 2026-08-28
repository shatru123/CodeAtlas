import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface ContextualHelpBoxProps {
  title: string;
  summary: string;
  details?: string;
}

export const ContextualHelpBox: React.FC<ContextualHelpBoxProps> = ({ title, summary, details }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '10px', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: details ? 'pointer' : 'default' }} onClick={() => details && setIsExpanded(!isExpanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <HelpCircle size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white' }}>{title}</span>
        </div>

        {details && (
          <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>{summary}</p>

      {isExpanded && details && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--accent-cyan)', lineHeight: '1.5' }}>
          {details}
        </div>
      )}
    </div>
  );
};
