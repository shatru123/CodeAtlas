import React from 'react';
import { HelpCircle, ArrowRight, Play } from 'lucide-react';

interface EducationalEmptyStateProps {
  title: string;
  reason: string;
  explanation: string;
  actionText: string;
  onAction: () => void;
  icon?: React.ComponentType<{ size?: number; color?: string }>;
}

export const EducationalEmptyState: React.FC<EducationalEmptyStateProps> = ({
  title,
  reason,
  explanation,
  actionText,
  onAction,
  icon: Icon = HelpCircle,
}) => {
  return (
    <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', maxWidth: '600px', margin: '2rem auto' }}>
      <div style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid var(--accent-indigo)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={28} color="var(--accent-indigo)" />
      </div>

      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white', marginBottom: '0.35rem' }}>{title}</h3>
        <div style={{ fontSize: '0.82rem', color: 'var(--accent-amber)', fontWeight: '700', marginBottom: '0.75rem' }}>{reason}</div>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>{explanation}</p>
      </div>

      <button onClick={onAction} className="btn-primary" style={{ padding: '0.65rem 1.3rem', fontSize: '0.88rem', marginTop: '0.5rem' }}>
        <Play size={16} />
        <span>{actionText}</span>
      </button>
    </div>
  );
};
