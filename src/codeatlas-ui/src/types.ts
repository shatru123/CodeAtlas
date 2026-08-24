export interface AgentStepEvent {
  stepId: string;
  agentName: 'PlannerAgent' | 'ResearcherAgent' | 'CoderAgent' | 'ValidatorAgent' | 'System' | string;
  thought: string;
  actionName?: string;
  actionInput?: string;
  actionOutput?: string;
  timestamp: string;
}

export interface CodeDiffModel {
  filePath: string;
  originalContent: string;
  modifiedContent: string;
  patch: string;
}

export interface TaskStatusResponse {
  taskId: string;
  status: string;
  currentAgent: string;
  currentStep: number;
  steps: AgentStepEvent[];
  diffs: CodeDiffModel[];
  startedAt: string;
  completedAt?: string;
}

export interface StartTaskRequest {
  repoUrl: string;
  taskDescription: string;
  targetBranch?: string;
  model?: string;
}
