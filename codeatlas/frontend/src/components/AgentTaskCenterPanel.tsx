import React, { useState, useEffect } from 'react';
import { Hammer, Play, CheckCircle2, AlertCircle, RefreshCw, GitPullRequest, FileCode, Clock, ShieldCheck, Check, X } from 'lucide-react';
import { apiService } from '../services/apiService';

interface AgentTaskCenterPanelProps {
  repoId: string;
}

export const AgentTaskCenterPanel: React.FC<AgentTaskCenterPanelProps> = ({ repoId }) => {
  const [prompt, setPrompt] = useState('Add exponential retry policy to PaymentService HTTP client');
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(() => {
      fetchTasks();
    }, 2500);
    return () => clearInterval(interval);
  }, [repoId]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const list = await apiService.getAgentTasks(repoId);
      setTasks(list);
      if (list.length > 0 && !selectedTask) {
        setSelectedTask(list[0]);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsCreating(true);
    try {
      const newTask = await apiService.createAgentTask(repoId, prompt, 0);
      setPrompt('');
      fetchTasks();
      setSelectedTask(newTask);
    } catch {
      // Fallback
    } finally {
      setIsCreating(false);
    }
  };

  const handleApproveGate = async (taskId: string, approved: boolean) => {
    try {
      await apiService.approveAgentTask(taskId, approved);
      fetchTasks();
    } catch {
      // Fallback
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(88, 28, 135, 0.5))', border: '1.5px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)' }}>
              <Hammer size={26} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>Autonomous Agent Task Center</h2>
                <span style={{ background: 'rgba(168, 85, 247, 0.18)', color: 'var(--accent-purple)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                  Tool Choice Loop Active
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Execute autonomous coding, bug fixes, refactoring, and dependency migrations inside isolated Docker sandboxes.
              </p>
            </div>
          </div>

          <button onClick={fetchTasks} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            <RefreshCw size={15} /> Refresh Tasks
          </button>
        </div>

        {/* Task Creation Form */}
        <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '0.65rem' }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the feature, bug fix, or refactoring task for the agent..."
            style={{ flex: 1, background: 'rgba(0,0,0,0.45)', border: '1px solid var(--border-card)', padding: '0.65rem 1rem', borderRadius: '10px', color: 'white', fontSize: '0.9rem', outline: 'none' }}
          />
          <button type="submit" disabled={isCreating} className="btn-primary" style={{ padding: '0.65rem 1.4rem', fontSize: '0.88rem' }}>
            {isCreating ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
            <span>Launch Agent Task</span>
          </button>
        </form>
      </div>

      {/* Main Grid: Tasks List vs Selected Task Execution Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
        {/* Tasks List */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} color="var(--accent-indigo)" /> Active & Recent Tasks ({tasks.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '520px', overflowY: 'auto' }}>
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                style={{
                  background: selectedTask?.id === task.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(0,0,0,0.3)',
                  border: selectedTask?.id === task.id ? '1.5px solid var(--accent-indigo)' : '1px solid var(--border-card)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'white', marginBottom: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {task.prompt}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span style={{ background: task.status === 'Completed' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(99, 102, 241, 0.15)', color: task.status === 'Completed' ? 'var(--accent-emerald)' : 'var(--accent-indigo)', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: '800' }}>
                    {task.status}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{task.progressPercentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Task Details & Timeline */}
        {selectedTask ? (
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header & Status Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'white' }}>{selectedTask.prompt}</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', marginTop: '0.2rem' }}>
                  Branch: {selectedTask.branchName || 'codeatlas/agent/task-...'}
                </div>
              </div>

              {selectedTask.pullRequestUrl && (
                <a href={selectedTask.pullRequestUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', gap: '0.4rem' }}>
                  <GitPullRequest size={15} /> Open Pull Request
                </a>
              )}
            </div>

            {/* Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '0.35rem' }}>
                <span>Phase: {selectedTask.currentPhase || 'Running'}</span>
                <span>{selectedTask.progressPercentage || 0}% Complete</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.5)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: 'linear-gradient(90deg, var(--accent-indigo), var(--accent-cyan))', height: '100%', width: `${selectedTask.progressPercentage || 0}%`, transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* Human Approval Gate Prompt if waiting */}
            {selectedTask.requiresHumanApproval && (
              <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1.5px solid var(--accent-amber)', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: '800', color: 'var(--accent-amber)', fontSize: '0.9rem' }}>⚠️ Human Approval Required Gate</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>The agent requires your approval to commit and create Pull Request on branch.</div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleApproveGate(selectedTask.id, true)} className="btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                    <Check size={14} /> Approve & Push
                  </button>
                  <button onClick={() => handleApproveGate(selectedTask.id, false)} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            )}

            {/* Execution Timeline */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'white', marginBottom: '0.85rem' }}>Execution Timeline & Evidence Log</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {selectedTask.timeline?.map((step: any, idx: number) => (
                  <div key={idx} style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <CheckCircle2 size={16} color="var(--accent-emerald)" />
                        <span style={{ fontWeight: '800', color: 'white', fontSize: '0.88rem' }}>{step.title}</span>
                        <span style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)', padding: '0.1rem 0.5rem', borderRadius: '10px', fontSize: '0.68rem', fontWeight: '800' }}>
                          Phase: {step.phase}
                        </span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Hammer size={32} style={{ marginBottom: '0.5rem', color: 'var(--text-dim)' }} />
            <p>Select or launch an agent task to view live execution timeline.</p>
          </div>
        )}
      </div>
    </div>
  );
};
