import React, { useState } from 'react';
import { Play, FolderGit2, Code, Sparkles } from 'lucide-react';
import type { StartTaskRequest } from '../types';

interface TaskFormProps {
  onSubmit: (request: StartTaskRequest) => void;
  isLoading: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, isLoading }) => {
  const [repoUrl, setRepoUrl] = useState('https://github.com/shatru123/CodeAtlas');
  const [taskDescription, setTaskDescription] = useState('Add health check endpoint, configure OpenTelemetry metrics, and create unit tests');
  const [targetBranch, setTargetBranch] = useState('feature/ai-agent-update');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim() || !taskDescription.trim()) return;

    onSubmit({
      repoUrl: repoUrl.trim(),
      taskDescription: taskDescription.trim(),
      targetBranch: targetBranch.trim()
    });
  };

  return (
    <form className="task-form-card" onSubmit={handleSubmit}>
      <h2 className="card-title">
        <Sparkles className="icon-sparkle" size={18} /> Launch Autonomous Agent Task
      </h2>
      
      <div className="form-group">
        <label className="form-label">
          <FolderGit2 size={16} /> GitHub Repository URL
        </label>
        <input
          type="url"
          className="form-input"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/user/repository"
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          <Code size={16} /> Task / Feature Requirement Description
        </label>
        <textarea
          className="form-textarea"
          rows={3}
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          placeholder="Describe the feature, bug fix, or refactoring task you want the AI agent to execute..."
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-row">
        <div className="form-group half">
          <label className="form-label">Target Git Branch</label>
          <input
            type="text"
            className="form-input"
            value={targetBranch}
            onChange={(e) => setTargetBranch(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? (
            <span>Agent Initializing...</span>
          ) : (
            <>
              <Play size={16} /> Start Implementation Task
            </>
          )}
        </button>
      </div>
    </form>
  );
};
