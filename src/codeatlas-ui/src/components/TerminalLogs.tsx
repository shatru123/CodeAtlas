import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';

interface LogItem {
  id: string;
  source: string;
  message: string;
  timestamp: string;
  isError?: boolean;
}

interface TerminalLogsProps {
  logs: LogItem[];
  onClear?: () => void;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs, onClear }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="terminal-card">
      <div className="terminal-header">
        <div className="terminal-title">
          <Terminal size={16} />
          <span>Real-Time Execution & Build Output</span>
        </div>
        {onClear && (
          <button className="btn-icon" onClick={onClear} title="Clear Terminal">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="terminal-body">
        {logs.length === 0 ? (
          <div className="terminal-line text-muted">
            [System] Waiting for agent execution stream...
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`terminal-line ${log.isError ? 'error' : ''} source-${log.source.toLowerCase()}`}
            >
              <span className="log-time">[{log.timestamp}]</span>
              <span className="log-source">[{log.source}]</span>
              <span className="log-msg">{log.message}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
