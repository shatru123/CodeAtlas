import React from 'react';
import { Brain, Search, Code2, CheckCircle2, Loader2 } from 'lucide-react';
import type { AgentStepEvent } from '../types';

interface AgentPipelineProps {
  currentStatus: string;
  currentAgent: string;
  steps: AgentStepEvent[];
}

export const AgentPipeline: React.FC<AgentPipelineProps> = ({ currentStatus, currentAgent, steps }) => {
  const agents = [
    { key: 'PlannerAgent', label: 'Planner Agent', desc: 'Decomposes task into sub-goals', icon: Brain },
    { key: 'ResearcherAgent', label: 'Researcher Agent', desc: 'Searches symbols & files', icon: Search },
    { key: 'CoderAgent', label: 'Coder Agent', desc: 'Generates code modifications', icon: Code2 },
    { key: 'ValidatorAgent', label: 'Validator Agent', desc: 'Runs build & verifies tests', icon: CheckCircle2 },
  ];

  const getAgentState = (agentKey: string) => {
    const hasExecuted = steps.some(s => s.agentName === agentKey);
    const isCurrent = currentAgent === agentKey;

    if (isCurrent && currentStatus !== 'Completed' && currentStatus !== 'Failed') {
      return 'active';
    }
    if (hasExecuted || currentStatus === 'Completed') {
      return 'completed';
    }
    return 'idle';
  };

  return (
    <div className="pipeline-card">
      <h3 className="pipeline-title">Multi-Agent Execution Pipeline</h3>
      <div className="pipeline-steps">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          const state = getAgentState(agent.key);
          const latestStep = steps.filter(s => s.agentName === agent.key).pop();

          return (
            <div key={agent.key} className={`pipeline-step ${state}`}>
              <div className="step-number">{index + 1}</div>
              <div className="step-icon">
                {state === 'active' ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Icon size={20} />
                )}
              </div>
              <div className="step-content">
                <div className="step-header">
                  <h4>{agent.label}</h4>
                  <span className={`step-badge ${state}`}>{state.toUpperCase()}</span>
                </div>
                <p className="step-desc">{latestStep?.thought || agent.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
