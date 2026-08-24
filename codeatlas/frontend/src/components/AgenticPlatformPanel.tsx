import React, { useState, useEffect, useRef } from 'react';
import { Play, FolderGit2, Code, Sparkles, Brain, Search, Code2, CheckCircle2, Loader2, GitCompare, FileCode, Terminal, Trash2 } from 'lucide-react';
import { DiffEditor } from '@monaco-editor/react';
import * as signalR from '@microsoft/signalr';
import axios from 'axios';

interface AgentStepEvent {
  stepId: string;
  agentName: string;
  thought: string;
  actionName?: string;
  actionInput?: string;
  actionOutput?: string;
  timestamp: string;
}

interface CodeDiffModel {
  filePath: string;
  originalContent: string;
  modifiedContent: string;
  patch: string;
}

interface TaskStatusResponse {
  taskId: string;
  status: string;
  currentAgent: string;
  currentStep: number;
  steps: AgentStepEvent[];
  diffs: CodeDiffModel[];
  startedAt: string;
  completedAt?: string;
}

const getAgentServerUrl = () => {
  return 'http://localhost:5000';
};

export const AgenticPlatformPanel: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('https://github.com/shatru123/CodeAtlas');
  const [taskDescription, setTaskDescription] = useState('Add health check endpoint, configure OpenTelemetry metrics, and create unit tests');
  const [targetBranch, setTargetBranch] = useState('feature/ai-agent-update');
  
  const [currentTask, setCurrentTask] = useState<TaskStatusResponse | null>(null);
  const [steps, setSteps] = useState<AgentStepEvent[]>([]);
  const [diffs, setDiffs] = useState<CodeDiffModel[]>([]);
  const [logs, setLogs] = useState<Array<{ id: string; source: string; message: string; timestamp: string; isError?: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  const addLog = (source: string, message: string, isError: boolean = false) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        source,
        message,
        timestamp: new Date().toLocaleTimeString(),
        isError,
      },
    ]);
  };

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleStartTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim() || !taskDescription.trim()) return;

    setIsLoading(true);
    setLogs([]);
    setSteps([]);
    setDiffs([]);

    const baseUrl = getAgentServerUrl();

    try {
      const response = await axios.post<TaskStatusResponse>(`${baseUrl}/api/agenttask/start`, {
        repoUrl: repoUrl.trim(),
        taskDescription: taskDescription.trim(),
        targetBranch: targetBranch.trim(),
      });

      const task = response.data;
      setCurrentTask(task);
      addLog('System', `Autonomous Agentic Task launched with ID: ${task.taskId}`);

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${baseUrl}/hubs/execution`)
        .withAutomaticReconnect()
        .build();

      connection.on('ReceiveAgentStep', (step: AgentStepEvent) => {
        setSteps((prev) => [...prev, step]);
        addLog(step.agentName, step.thought);
      });

      connection.on('ReceiveLogOutput', (_taskId: string, source: string, message: string) => {
        addLog(source, message);
      });

      connection.on('ReceiveBuildOutput', (_taskId: string, outputLine: string, isError: boolean) => {
        addLog('ValidatorAgent', outputLine, isError);
      });

      connection.on('ReceiveCodeDiff', (_taskId: string, diff: CodeDiffModel) => {
        setDiffs((prev) => [...prev.filter((d) => d.filePath !== diff.filePath), diff]);
      });

      connection.on('ReceiveTaskStatus', (_taskId: string, status: string, agent: string) => {
        setCurrentTask((prev) => (prev ? { ...prev, status, currentAgent: agent } : null));
        addLog('System', `Task state: ${status} (${agent})`);

        if (status === 'Completed' || status === 'Failed') {
          setIsLoading(false);
        }
      });

      await connection.start();
      await connection.invoke('JoinTaskGroup', task.taskId);
    } catch (err: any) {
      addLog('Error', `Failed to launch agent task: ${err.message}`, true);
      setIsLoading(false);
    }
  };

  const agents = [
    { key: 'PlannerAgent', label: 'Planner Agent', desc: 'Decomposes task into sub-goals', icon: Brain },
    { key: 'ResearcherAgent', label: 'Researcher Agent', desc: 'Searches symbols & files', icon: Search },
    { key: 'CoderAgent', label: 'Coder Agent', desc: 'Generates code modifications', icon: Code2 },
    { key: 'ValidatorAgent', label: 'Validator Agent', desc: 'Runs build & verifies tests', icon: CheckCircle2 },
  ];

  const getAgentState = (agentKey: string) => {
    const hasExecuted = steps.some((s) => s.agentName === agentKey);
    const isCurrent = currentTask?.currentAgent === agentKey;

    if (isCurrent && currentTask?.status !== 'Completed' && currentTask?.status !== 'Failed') {
      return 'active';
    }
    if (hasExecuted || currentTask?.status === 'Completed') {
      return 'completed';
    }
    return 'idle';
  };

  const selectedDiff = diffs[selectedIndex] || diffs[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      {/* Top Grid: Task Form & Agent Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        {/* Task Form Card */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent-amber)" /> Launch Autonomous Agent Task
          </h3>

          <form onSubmit={handleStartTask} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <FolderGit2 size={15} color="var(--accent-cyan)" /> Target GitHub Repository URL
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/shatru123/CodeAtlas"
                required
                disabled={isLoading}
                style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                <Code size={15} color="var(--accent-purple)" /> Task Requirement Description
              </label>
              <textarea
                rows={3}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Describe the feature or code modification you want the AI agent to execute..."
                required
                disabled={isLoading}
                style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff', fontSize: '0.875rem', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  Target Git Branch
                </label>
                <input
                  type="text"
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value)}
                  disabled={isLoading}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '6px', color: '#fff', fontSize: '0.875rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
                style={{ padding: '0.7rem 1.25rem', fontSize: '0.875rem', fontWeight: '700', height: '42px' }}
              >
                {isLoading ? (
                  <span>Executing Task...</span>
                ) : (
                  <>
                    <Play size={16} /> Start Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Agent Pipeline Card */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '1rem' }}>
            Multi-Agent State Machine Pipeline
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {agents.map((agent, idx) => {
              const Icon = agent.icon;
              const state = getAgentState(agent.key);
              const latestStep = steps.filter((s) => s.agentName === agent.key).pop();

              return (
                <div
                  key={agent.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.75rem 1rem',
                    background: state === 'active' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(0,0,0,0.25)',
                    border: `1px solid ${state === 'active' ? 'var(--accent-cyan)' : state === 'completed' ? 'var(--accent-green)' : 'var(--border-card)'}`,
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '800' }}>
                    {idx + 1}
                  </div>
                  <div style={{ color: state === 'active' ? 'var(--accent-cyan)' : state === 'completed' ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {state === 'active' ? <Loader2 className="spin" size={20} /> : <Icon size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '700' }}>{agent.label}</h4>
                      <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', background: state === 'completed' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)', color: state === 'completed' ? '#10b981' : 'var(--text-muted)' }}>
                        {state.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {latestStep?.thought || agent.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Monaco Diff Viewer & Real-Time Terminal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        {/* Code Diff Editor */}
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.95rem' }}>
              <GitCompare size={18} color="var(--accent-purple)" />
              <span>Generated Code Modifications ({diffs.length})</span>
            </div>
            {diffs.length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {diffs.map((diff, i) => (
                  <button
                    key={diff.filePath}
                    onClick={() => setSelectedIndex(i)}
                    className={i === selectedIndex ? 'btn-primary' : 'btn-secondary'}
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <FileCode size={13} />
                    <span>{diff.filePath}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-card)' }}>
            {diffs.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <GitCompare size={36} style={{ opacity: 0.5 }} />
                <p style={{ fontSize: '0.875rem' }}>No code diffs yet. The Coder Agent will display side-by-side modifications here once generated.</p>
              </div>
            ) : (
              <DiffEditor
                height="400px"
                language="csharp"
                theme="vs-dark"
                original={selectedDiff.originalContent}
                modified={selectedDiff.modifiedContent}
                options={{ readOnly: true, renderSideBySide: true, minimap: { enabled: false }, fontSize: 13 }}
              />
            )}
          </div>
        </div>

        {/* Real-Time Terminal Execution Log */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.95rem' }}>
              <Terminal size={18} color="var(--accent-cyan)" />
              <span>Real-Time Execution & Build Terminal</span>
            </div>
            <button onClick={() => setLogs([])} className="btn-secondary" style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }} title="Clear Console">
              <Trash2 size={13} />
            </button>
          </div>

          <div
            style={{
              background: '#090d16',
              border: '1px solid var(--border-card)',
              borderRadius: '8px',
              padding: '1rem',
              fontFamily: "'Fira Code', monospace",
              fontSize: '0.8rem',
              minHeight: '400px',
              maxHeight: '400px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            {logs.length === 0 ? (
              <span style={{ color: 'var(--text-muted)' }}>[System] Waiting for agent execution stream...</span>
            ) : (
              logs.map((l) => (
                <div key={l.id} style={{ color: l.isError ? '#ef4444' : '#cbd5e1', lineHeight: '1.4', wordBreak: 'break-all' }}>
                  <span style={{ color: '#475569', marginRight: '6px' }}>[{l.timestamp}]</span>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: '700', marginRight: '6px' }}>[{l.source}]</span>
                  <span>{l.message}</span>
                </div>
              ))
            )}
            <div ref={terminalBottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
