import React, { useState, useEffect } from 'react';
import { Search, X, Compass, Hammer, SearchCode, ShieldCheck, Activity, FileCode, Globe, Database, ArrowRight } from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (pillar: string, subTab: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose, onSelectAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commandItems = [
    { label: 'Universal System Explorer', category: 'UNDERSTAND', pillar: 'understand', subTab: 'system_explorer', icon: Compass },
    { label: 'Knowledge Graph Explorer', category: 'UNDERSTAND', pillar: 'understand', subTab: 'graph', icon: Compass },
    { label: 'REST APIs Catalog', category: 'UNDERSTAND', pillar: 'understand', subTab: 'apis', icon: Globe },
    { label: 'Database & ORM Schemas', category: 'UNDERSTAND', pillar: 'understand', subTab: 'databases', icon: Database },
    { label: 'Autonomous Agent Task Center', category: 'BUILD', pillar: 'build', subTab: 'agent_tasks', icon: Hammer },
    { label: 'AI RAG Code Assistant', category: 'BUILD', pillar: 'build', subTab: 'ai', icon: Hammer },
    { label: 'Code Execution Terminal Runner', category: 'BUILD', pillar: 'build', subTab: 'runner', icon: Hammer },
    { label: 'Production Root Cause Analysis (RCA)', category: 'INVESTIGATE', pillar: 'investigate', subTab: 'rca', icon: SearchCode },
    { label: 'Blast Radius Impact Prediction', category: 'INVESTIGATE', pillar: 'investigate', subTab: 'impact', icon: SearchCode },
    { label: 'Git Branch Diff Delta', category: 'INVESTIGATE', pillar: 'investigate', subTab: 'diff', icon: SearchCode },
    { label: 'Architecture Graph & Rules', category: 'ARCHITECTURE', pillar: 'architecture', subTab: 'architecture', icon: ShieldCheck },
    { label: 'Multi-Repo Workspace Mesh', category: 'ARCHITECTURE', pillar: 'architecture', subTab: 'mesh', icon: ShieldCheck },
    { label: '7-Pillar Engineering Health Radar', category: 'ENGINEERING HEALTH', pillar: 'health', subTab: 'doctor', icon: Activity },
    { label: 'Security & CVE Vulnerability Audit', category: 'ENGINEERING HEALTH', pillar: 'health', subTab: 'security', icon: Activity },
  ];

  const filteredItems = commandItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        onSelectAction(selected.pillar, selected.subTab);
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onSelectAction, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh', paddingLeft: '1rem', paddingRight: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '640px', padding: '1rem', border: '1.5px solid var(--accent-indigo)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {/* Search Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-card)', padding: '0.75rem 1rem', borderRadius: '10px' }}>
          <Search size={18} color="var(--accent-cyan)" />
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, symbol, API, or feature (e.g., System Explorer, Agent, Security)..."
            style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.95rem', outline: 'none', width: '100%' }}
          />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontFamily: 'var(--font-code)' }}>
            ESC to close
          </span>
        </div>

        {/* Results List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '380px', overflowY: 'auto' }}>
          {filteredItems.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={idx}
                onClick={() => {
                  onSelectAction(item.pillar, item.subTab);
                  onClose();
                }}
                style={{
                  background: isSelected ? 'rgba(99, 102, 241, 0.22)' : 'rgba(0,0,0,0.25)',
                  border: isSelected ? '1px solid var(--accent-indigo)' : '1px solid transparent',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Icon size={18} color={isSelected ? 'white' : 'var(--accent-cyan)'} />
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: isSelected ? 'white' : 'var(--text-main)' }}>{item.label}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--accent-indigo)', background: 'rgba(99, 102, 241, 0.15)', padding: '0.1rem 0.45rem', borderRadius: '10px' }}>
                    {item.category}
                  </span>
                  {isSelected && <ArrowRight size={16} color="white" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
