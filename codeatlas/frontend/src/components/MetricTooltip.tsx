import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface MetricTooltipProps {
  term: string;
  explanation: string;
}

export const MetricTooltip: React.FC<MetricTooltipProps> = ({ term, explanation }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', cursor: 'help' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span style={{ borderBottom: '1px dotted var(--text-muted)' }}>{term}</span>
      <HelpCircle size={13} color="var(--accent-cyan)" />
      {isVisible && (
        <span
          style={{
            position: 'absolute',
            bottom: '125%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--accent-indigo)',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'normal',
            lineHeight: '1.3',
            width: '220px',
            zIndex: 100,
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            pointerEvents: 'none'
          }}
        >
          <strong style={{ color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.2rem' }}>ℹ️ {term}</strong>
          {explanation}
        </span>
      )}
    </span>
  );
};
