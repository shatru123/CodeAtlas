import React, { useState } from 'react';
import { Compass, Hammer, SearchCode, ShieldCheck, Activity, X, ArrowRight, Check } from 'lucide-react';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (pillar: string, subTab: string) => void;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({ isOpen, onClose, onSelectTab }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Welcome to CodeAtlas 3.0',
      subtitle: 'Your AI Engineering Intelligence & Autonomous Software Platform',
      icon: Compass,
      color: 'var(--accent-indigo)',
      description: 'CodeAtlas understands your entire codebase, explains it with evidence, predicts change impact, investigates production incidents, and safely modifies code using autonomous agents.',
      actionLabel: 'Start Product Tour',
      pillar: 'understand',
      subTab: 'system_explorer',
    },
    {
      title: '1. UNDERSTAND Pillar',
      subtitle: 'Universal System Explorer & Code Graph',
      icon: Compass,
      color: 'var(--accent-cyan)',
      description: 'Ask any natural language question across source code, AST, REST APIs, databases, events, and execution flows. Get call sequence traces backed by file & line evidence.',
      actionLabel: 'Explore UNDERSTAND',
      pillar: 'understand',
      subTab: 'system_explorer',
    },
    {
      title: '2. BUILD Pillar',
      subtitle: 'Autonomous AI Agent Task Center',
      icon: Hammer,
      color: 'var(--accent-purple)',
      description: 'Delegate complex coding, bug fixes, refactoring, and test generation to tool-driven autonomous AI agents operating inside isolated Docker sandboxes.',
      actionLabel: 'Explore BUILD',
      pillar: 'build',
      subTab: 'agent_tasks',
    },
    {
      title: '3. INVESTIGATE Pillar',
      subtitle: 'Production Incident RCA & OpenTelemetry APM',
      icon: SearchCode,
      color: 'var(--accent-rose)',
      description: 'Paste production stack traces to correlate exceptions directly with static AST definitions, Git commit history, and launch 1-click Agent fixes.',
      actionLabel: 'Explore INVESTIGATE',
      pillar: 'investigate',
      subTab: 'rca',
    },
    {
      title: '4. ARCHITECTURE & HEALTH Pillars',
      subtitle: '7-Pillar Health Radar & Rule Enforcement',
      icon: ShieldCheck,
      color: 'var(--accent-emerald)',
      description: 'Monitor overall engineering health scores across Architecture, Security, Dependencies, Testing, Observability, Documentation, and Complexity.',
      actionLabel: 'Launch CodeAtlas',
      pillar: 'health',
      subTab: 'doctor',
    },
  ];

  const current = tourSteps[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      onSelectTab(current.pillar, current.subTab);
      onClose();
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '580px', padding: '2rem', border: `1.5px solid ${current.color}`, display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        {/* Step Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: current.color, width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
            <Icon size={26} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: current.color, textTransform: 'uppercase' }}>
              Step {step + 1} of {tourSteps.length}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', margin: 0 }}>{current.title}</h3>
          </div>
        </div>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>{current.description}</p>

        {/* Step Indicator Dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setStep(idx)}
                style={{
                  width: idx === step ? '24px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: idx === step ? current.color : 'rgba(255,255,255,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button onClick={onClose} className="btn-secondary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}>
              Skip Tour
            </button>
            <button onClick={handleNext} className="btn-primary" style={{ padding: '0.45rem 1.15rem', fontSize: '0.82rem' }}>
              <span>{current.actionLabel}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
