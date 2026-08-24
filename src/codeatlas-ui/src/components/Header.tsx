import React from 'react';
import { Bot, GitBranch, Cpu, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTaskStatus?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentTaskStatus }) => {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="brand-logo">
          <Bot className="icon-bot" />
        </div>
        <div>
          <h1 className="brand-title">
            CodeAtlas <span className="badge-ai"><Sparkles size={12} /> Agentic AI</span>
          </h1>
          <p className="brand-subtitle">Autonomous .NET & React Software Engineering Platform</p>
        </div>
      </div>

      <div className="header-actions">
        <div className="status-badge">
          <Cpu size={14} className="icon-pulse" />
          <span>Status: <strong>{currentTaskStatus || 'Ready'}</strong></span>
        </div>
        <div className="branch-badge">
          <GitBranch size={14} />
          <span>branch: <strong>agentic-platform</strong></span>
        </div>
      </div>
    </header>
  );
};
