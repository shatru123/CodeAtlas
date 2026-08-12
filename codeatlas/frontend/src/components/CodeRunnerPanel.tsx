import React, { useState, useEffect, useRef } from 'react';
import { CodeRunnerDetectionResult, CodeRunnerExecutionResult } from '../types/api';
import { apiService } from '../services/apiService';
import { Play, Square, Terminal, Cpu, RefreshCw, Copy, Check, Trash2, ArrowDownCircle, AlertCircle, Clock } from 'lucide-react';

interface CodeRunnerPanelProps {
  repoId: string;
}

export const CodeRunnerPanel: React.FC<CodeRunnerPanelProps> = ({ repoId }) => {
  const [detection, setDetection] = useState<CodeRunnerDetectionResult | null>(null);
  const [customCommand, setCustomCommand] = useState<string>('');
  const [execution, setExecution] = useState<CodeRunnerExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const fetchDetection = async () => {
    try {
      const data = await apiService.detectRunner(repoId);
      setDetection(data);
      setCustomCommand(data.recommendedCommand);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchDetection();
  }, [repoId]);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [execution, autoScroll]);

  const handleRun = async (cmdToRun?: string) => {
    setIsRunning(true);
    const cmd = cmdToRun || customCommand;
    setExecution({
      processId: 'proc_active',
      commandExecuted: cmd,
      status: 'Running',
      exitCode: 0,
      executionDurationMs: 0,
      terminalOutput: `[CodeAtlas Terminal] $ ${cmd}\nStarting process execution...\n`,
      standardError: '',
    });

    try {
      const res = await apiService.executeCode(repoId, {
        customCommand: cmd,
        timeoutSeconds: 45,
      });
      setExecution(res);
    } catch (err: any) {
      setExecution((prev) => ({
        processId: 'proc_failed',
        commandExecuted: cmd,
        status: 'Failed',
        exitCode: 1,
        executionDurationMs: 0,
        terminalOutput: prev?.terminalOutput || '',
        standardError: err.message || 'Execution error encountered.',
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const handleStop = async () => {
    try {
      await apiService.stopCode(repoId);
      setExecution((prev) => prev ? { ...prev, status: 'Stopped', standardError: 'Process terminated by user.' } : null);
    } catch {
      // Ignore
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyTerminal = () => {
    const text = (execution?.terminalOutput || '') + '\n' + (execution?.standardError || '');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearTerminal = () => {
    setExecution(null);
  };

  if (!detection) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
      {/* Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(99, 102, 241, 0.12))', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.66rem', marginBottom: '0.3rem' }}>
            <Cpu size={24} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'white' }}>Universal Code Runner & Live Execution Engine</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Detects project runtimes (.NET, Node.js, Python, Java, Go, Rust, Docker) and executes code with live IDE terminal output logs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>{detection.language}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Detected Runtime</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{detection.framework}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Framework</div>
          </div>
        </div>
      </div>

      {/* Execution Command Input Toolbar */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0, width: '100%', flexWrap: 'wrap' }}>
            <Terminal size={20} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={customCommand}
              onChange={(e) => setCustomCommand(e.target.value)}
              placeholder="Enter execution command (e.g. dotnet run, npm start)..."
              style={{
                flex: 1,
                minWidth: '160px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-card)',
                color: '#38bdf8',
                padding: '0.6rem 0.85rem',
                borderRadius: '8px',
                fontFamily: 'var(--font-code)',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {isRunning ? (
              <button
                onClick={handleStop}
                style={{ background: 'var(--accent-rose)', color: 'white', border: 'none', padding: '0.6rem 1.3rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}
              >
                <Square size={16} /> Stop Process
              </button>
            ) : (
              <button
                onClick={() => handleRun()}
                style={{ background: 'var(--accent-emerald)', color: 'white', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)', whiteSpace: 'nowrap' }}
              >
                <Play size={16} /> Run Application
              </button>
            )}
          </div>
        </div>

        {/* Quick Launch Commands */}
        {detection.availableCommands.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-card)', paddingTop: '0.75rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700' }}>Quick Commands:</span>
            {detection.availableCommands.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCustomCommand(cmd);
                  handleRun(cmd);
                }}
                style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid var(--border-card)', color: 'white', padding: '0.25rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-code)' }}
              >
                ▶ {cmd}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* IDE Terminal Output View */}
      <div className="glass-panel" style={{ padding: '0', background: '#0b0f17', borderRadius: '12px', border: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column', minHeight: '420px', minWidth: 0 }}>
        {/* Terminal Header */}
        <div style={{ background: '#111827', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderRadius: '12px 12px 0 0', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', minWidth: 0 }}>
            <Terminal size={16} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white', whiteSpace: 'nowrap' }}>Terminal Console Output</span>

            {execution && (
              <span style={{
                background: execution.status === 'Completed' ? 'rgba(16, 185, 129, 0.2)' : execution.status === 'Running' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                color: execution.status === 'Completed' ? 'var(--accent-emerald)' : execution.status === 'Running' ? 'var(--accent-cyan)' : 'var(--accent-rose)',
                padding: '0.15rem 0.55rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: '800',
                whiteSpace: 'nowrap'
              }}>
                {execution.status.toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {execution && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginRight: '0.5rem' }}>
                <Clock size={13} /> {execution.executionDurationMs} ms
              </span>
            )}

            <button
              onClick={() => setAutoScroll(!autoScroll)}
              title="Toggle Auto Scroll"
              style={{ background: autoScroll ? 'rgba(99, 102, 241, 0.2)' : 'transparent', border: 'none', color: autoScroll ? 'var(--accent-indigo)' : 'var(--text-muted)', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}
            >
              <ArrowDownCircle size={15} />
            </button>

            <button
              onClick={handleCopyTerminal}
              title="Copy Output"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}
            >
              {copied ? <Check size={15} color="var(--accent-emerald)" /> : <Copy size={15} />}
            </button>

            <button
              onClick={clearTerminal}
              title="Clear Terminal"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div style={{ padding: '1.25rem', fontFamily: 'var(--font-code)', fontSize: '0.82rem', color: '#38bdf8', lineHeight: '1.6', overflowY: 'auto', maxHeight: '520px', flex: 1, whiteSpace: 'pre-wrap' }}>
          {execution ? (
            <>
              <div style={{ color: 'var(--accent-emerald)', fontWeight: '700', marginBottom: '0.5rem' }}>
                $ {execution.commandExecuted}
              </div>
              {execution.terminalOutput}
              {execution.standardError && (
                <div style={{ color: '#fecdd3', background: 'rgba(244, 63, 94, 0.1)', padding: '0.5rem 0.75rem', borderRadius: '6px', marginTop: '0.5rem' }}>
                  <AlertCircle size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />
                  {execution.standardError}
                </div>
              )}
              <div ref={terminalEndRef} />
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '2rem 0', textAlign: 'center' }}>
              Terminal idle. Click "Run Application" to execute {detection.recommendedCommand}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
