import {
  AnalysisResult,
  ApiDefinition,
  ArchitectureSummary,
  CodeEntity,
  CodeRelationship,
  DatabaseReference,
  EventDefinition,
  RepositoryInfo,
  ScanGitHubRequest,
  ScanLocalRequest,
} from '../types/api';

const API_BASE = '/api/repositories';

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

  async getArchitecture(id: string): Promise<ArchitectureSummary> {
    const res = await fetch(`${API_BASE}/${id}/architecture`);
    if (!res.ok) throw new Error('Failed to fetch architecture summary');
    return res.json();
  },
};
