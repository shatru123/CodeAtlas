import {
  AnalysisResult,
  ApiDefinition,
  ArchitectureHandbook,
  ArchitectureSummary,
  BlastRadiusResult,
  BranchDiffResult,
  CodeEntity,
  CodeRelationship,
  CodeRunnerDetectionResult,
  CodeRunnerExecutionResult,
  DatabaseErdResult,
  DatabaseReference,
  EventDefinition,
  ExecuteCodeRequest,
  FunctionalFlow,
  InfrastructureTopology,
  PackageDependency,
  RepositoryInfo,
  ScanGitHubRequest,
  ScanLocalRequest,
  SecurityAuditResult,
  WorkspaceMeshSummary,
} from '../types/api';

const getBackendBaseUrl = () => {
  const metaEnv = (import.meta as any).env;
  if (metaEnv?.VITE_API_URL) return metaEnv.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://codeatlas-backend-p24q.onrender.com';
  }
  return '';
};

const BASE_URL = getBackendBaseUrl();
const API_BASE = `${BASE_URL}/api/repositories`;

export const apiService = {
  async listRepositories(): Promise<RepositoryInfo[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error('Failed to fetch repository list');
    return res.json();
  },

  async getRepository(id: string): Promise<AnalysisResult> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch analysis for repo ${id}`);
    return res.json();
  },

  async scanLocalRepository(req: ScanLocalRequest): Promise<AnalysisResult> {
    const res = await fetch(`${API_BASE}/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Scan failed' }));
      throw new Error(err.error || 'Local repository scan failed');
    }
    return res.json();
  },

  async scanGitHubRepository(req: ScanGitHubRequest): Promise<AnalysisResult> {
    const res = await fetch(`${API_BASE}/github`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Scan failed' }));
      throw new Error(err.error || 'GitHub repository scan failed');
    }
    return res.json();
  },

  async getEntities(id: string, type?: string): Promise<CodeEntity[]> {
    const url = type ? `${API_BASE}/${id}/entities?type=${encodeURIComponent(type)}` : `${API_BASE}/${id}/entities`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch entities');
    return res.json();
  },

  async getRelationships(id: string, type?: string): Promise<CodeRelationship[]> {
    const url = type ? `${API_BASE}/${id}/relationships?type=${encodeURIComponent(type)}` : `${API_BASE}/${id}/relationships`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch relationships');
    return res.json();
  },

  async getApis(id: string): Promise<ApiDefinition[]> {
    const res = await fetch(`${API_BASE}/${id}/apis`);
    if (!res.ok) throw new Error('Failed to fetch APIs');
    return res.json();
  },

  async getDatabases(id: string): Promise<DatabaseReference[]> {
    const res = await fetch(`${API_BASE}/${id}/databases`);
    if (!res.ok) throw new Error('Failed to fetch database references');
    return res.json();
  },

  async getEvents(id: string): Promise<EventDefinition[]> {
    const res = await fetch(`${API_BASE}/${id}/events`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async getPackages(id: string): Promise<PackageDependency[]> {
    const res = await fetch(`${API_BASE}/${id}/packages`);
    if (!res.ok) throw new Error('Failed to fetch package dependencies');
    return res.json();
  },

  async getFlows(id: string): Promise<FunctionalFlow[]> {
    const res = await fetch(`${API_BASE}/${id}/flows`);
    if (!res.ok) throw new Error('Failed to fetch functional flows');
    return res.json();
  },

  async getSecurity(id: string): Promise<SecurityAuditResult> {
    const res = await fetch(`${API_BASE}/${id}/security`);
    if (!res.ok) throw new Error('Failed to fetch security audit');
    return res.json();
  },

  async getWorkspaceMesh(): Promise<WorkspaceMeshSummary> {
    const res = await fetch(`${BASE_URL}/api/workspace/mesh`);
    if (!res.ok) throw new Error('Failed to fetch workspace mesh');
    return res.json();
  },

  async getImpact(id: string, entityName?: string): Promise<BlastRadiusResult> {
    const url = entityName ? `${API_BASE}/${id}/impact?entityName=${encodeURIComponent(entityName)}` : `${API_BASE}/${id}/impact`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch blast radius impact');
    return res.json();
  },

  async getDiff(id: string, targetBranch?: string): Promise<BranchDiffResult> {
    const url = targetBranch ? `${API_BASE}/${id}/diff?targetBranch=${encodeURIComponent(targetBranch)}` : `${API_BASE}/${id}/diff`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch branch diff');
    return res.json();
  },

  async getErd(id: string): Promise<DatabaseErdResult> {
    const res = await fetch(`${API_BASE}/${id}/erd`);
    if (!res.ok) throw new Error('Failed to fetch ERD synthesis');
    return res.json();
  },

  async getInfrastructure(id: string): Promise<InfrastructureTopology> {
    const res = await fetch(`${API_BASE}/${id}/infrastructure`);
    if (!res.ok) throw new Error('Failed to fetch infrastructure topology');
    return res.json();
  },

  async getHandbook(id: string): Promise<ArchitectureHandbook> {
    const res = await fetch(`${API_BASE}/${id}/handbook`);
    if (!res.ok) throw new Error('Failed to fetch architecture handbook');
    return res.json();
  },

  async getArchitecture(id: string): Promise<ArchitectureSummary> {
    const res = await fetch(`${API_BASE}/${id}/architecture`);
    if (!res.ok) throw new Error('Failed to fetch architecture summary');
    return res.json();
  },

  async detectRunner(id: string): Promise<CodeRunnerDetectionResult> {
    const res = await fetch(`${API_BASE}/${id}/runner/detect`);
    if (!res.ok) throw new Error('Failed to detect repository code runner');
    return res.json();
  },

  async executeCode(id: string, req: ExecuteCodeRequest): Promise<CodeRunnerExecutionResult> {
    const res = await fetch(`${API_BASE}/${id}/runner/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Execution failed' }));
      throw new Error(err.error || 'Code execution failed');
    }
    return res.json();
  },

  async stopCode(id: string): Promise<{ stopped: boolean }> {
    const res = await fetch(`${API_BASE}/${id}/runner/stop`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to stop code process');
    return res.json();
  },
};
