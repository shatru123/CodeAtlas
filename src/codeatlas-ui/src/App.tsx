import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TaskForm } from './components/TaskForm';
import { AgentPipeline } from './components/AgentPipeline';
import { MonacoDiffViewer } from './components/MonacoDiffViewer';
import { TerminalLogs } from './components/TerminalLogs';
import { CodeExplorer } from './components/CodeExplorer';
import type { StartTaskRequest, TaskStatusResponse, AgentStepEvent, CodeDiffModel } from './types';
import { api, createSignalRConnection } from './services/api';
import * as signalR from '@microsoft/signalr';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'explorer' | 'agent'>('agent');
  const [currentTask, setCurrentTask] = useState<TaskStatusResponse | null>(null);
  const [steps, setSteps] = useState<AgentStepEvent[]>([]);
  const [diffs, setDiffs] = useState<CodeDiffModel[]>([]);
  const [logs, setLogs] = useState<Array<{ id: string; source: string; message: string; timestamp: string; isError?: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [signalrConn, setSignalrConn] = useState<signalR.HubConnection | null>(null);

  const handleStartTask = async (request: StartTaskRequest) => {
    setIsLoading(true);
    setActiveTab('agent'); // Auto-switch to Agent Execution screen
    setLogs([]);
    setSteps([]);
    setDiffs([]);

    try {
      const task = await api.startTask(request);
      setCurrentTask(task);
      addLog('System', `Task launched with ID: ${task.taskId}`);

      // Connect SignalR Real-Time WebSockets Hub
      const conn = createSignalRConnection();

      conn.on('ReceiveAgentStep', (step: AgentStepEvent) => {
        setSteps((prev) => [...prev, step]);
        addLog(step.agentName, step.thought);
      });

      conn.on('ReceiveLogOutput', (_taskId: string, source: string, message: string) => {
        addLog(source, message);
      });

      conn.on('ReceiveBuildOutput', (_taskId: string, outputLine: string, isError: boolean) => {
        addLog('ValidatorAgent', outputLine, isError);
      });

      conn.on('ReceiveCodeDiff', (_taskId: string, diff: CodeDiffModel) => {
        setDiffs((prev) => [...prev.filter((d) => d.filePath !== diff.filePath), diff]);
      });

      conn.on('ReceiveTaskStatus', (_taskId: string, status: string, agent: string) => {
        setCurrentTask((prev) => (prev ? { ...prev, status, currentAgent: agent } : null));
        addLog('System', `Task state updated: ${status} (${agent})`);

        if (status === 'Completed' || status === 'Failed') {
          setIsLoading(false);
        }
      });

      await conn.start();
      await conn.invoke('JoinTaskGroup', task.taskId);
      setSignalrConn(conn);
    } catch (err: any) {
      addLog('Error', `Failed to start agent task: ${err.message}`, true);
      setIsLoading(false);
    }
  };

  const addLog = (source: string, message: string, isError: boolean = false) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        source,
        message,
        timestamp: new Date().toLocaleTimeString(),
        isError
      }
    ]);
  };

  useEffect(() => {
    return () => {
      if (signalrConn) {
        signalrConn.stop();
      }
    };
  }, [signalrConn]);

  return (
    <div className="app-container">
      <Header
        currentTaskStatus={currentTask?.status}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="main-content">
        {activeTab === 'explorer' ? (
          <CodeExplorer />
        ) : (
          <>
            <div className="top-grid">
              <TaskForm onSubmit={handleStartTask} isLoading={isLoading} />
              <AgentPipeline
                currentStatus={currentTask?.status || 'Idle'}
                currentAgent={currentTask?.currentAgent || 'System'}
                steps={steps}
              />
            </div>

            <div className="bottom-grid">
              <MonacoDiffViewer diffs={diffs} />
              <TerminalLogs logs={logs} onClear={() => setLogs([])} />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
