import React, { useEffect, useState } from 'react';
import { apiService } from './services/apiService';
import {
  RepositoryInfo,
  AnalysisResult,
  CodeEntity,
  ArchitectureSummary,
} from './types/api';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { GraphExplorer } from './components/GraphExplorer';
import { FlowExplorer } from './components/FlowExplorer';
import { ApiExplorer } from './components/ApiExplorer';
import { DatabaseExplorer } from './components/DatabaseExplorer';
import { EventExplorer } from './components/EventExplorer';
import { PackageExplorer } from './components/PackageExplorer';
import { ScanModal } from './components/ScanModal';
import { EntityDetailModal } from './components/EntityDetailModal';
import { ArchitecturePanel } from './components/ArchitecturePanel';
import { SecurityExplorer } from './components/SecurityExplorer';
import { MeshExplorer } from './components/MeshExplorer';
import { ImpactExplorer } from './components/ImpactExplorer';
import { DiffExplorer } from './components/DiffExplorer';
import { ErdExplorer } from './components/ErdExplorer';
import { InfrastructureExplorer } from './components/InfrastructureExplorer';
import { AiAssistantPanel } from './components/AiAssistantPanel';
import { CodeRunnerPanel } from './components/CodeRunnerPanel';
import { HandbookExporterView } from './components/HandbookExporterView';
import { AgenticPlatformPanel } from './components/AgenticPlatformPanel';
import { AdminAnalyticsModal } from './components/AdminAnalyticsModal';

import { Sparkles, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [repositories, setRepositories] = useState<RepositoryInfo[]>([]);
  const [activeRepo, setActiveRepo] = useState<RepositoryInfo | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [architecture, setArchitecture] = useState<ArchitectureSummary | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(260);

  const [selectedEntity, setSelectedEntity] = useState<CodeEntity | null>(null);
  const [activeTab, setActiveTab] = useState<
    'agentic' | 'ai' | 'graph' | 'runner' | 'flows' | 'apis' | 'databases' | 'events' | 'packages' | 'architecture' | 'security' | 'mesh' | 'impact' | 'diff' | 'erd' | 'infra' | 'handbook'
  >('agentic');

  // Admin Analytics Modal state & Secret Key trigger (Ctrl+Shift+A)
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Load Repositories on startup
  useEffect(() => {
    fetchRepositories();
    apiService.recordVisit();
  }, []);

  // Keyboard shortcut listener for Admin Analytics Modal (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchRepositories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.listRepositories();
      setRepositories(data);

      if (data.length > 0 && !activeRepo) {
        handleSelectRepo(data[0]);
      } else if (data.length === 0) {
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch repositories');
      setIsLoading(false);
    }
  };

  const handleSelectRepo = async (repo: RepositoryInfo) => {
    setActiveRepo(repo);
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiService.getRepository(repo.id);
      setAnalysis(result);

      try {
        const arch = await apiService.getArchitecture(repo.id);
        setArchitecture(arch);
      } catch (archErr) {
        console.warn('Architecture summary fetch failed:', archErr);
      }
    } catch (err: any) {
      setError(`Failed to load repository details: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanComplete = (result: AnalysisResult) => {
    setAnalysis(result);
    setActiveRepo(result.repository);
    fetchRepositories();
    setIsScanModalOpen(false);
  };

  const tabLabels: Record<string, string> = {
    agentic: 'Agentic AI Platform',
    ai: 'AI Code Assistant',
    graph: 'Knowledge Graph',
    runner: 'Code Runner',
    flows: 'Functional Flows',
    apis: 'REST APIs Catalog',
    databases: 'Database & ORM',
    events: 'Messaging Events',
    packages: 'Packages & Libraries',
    architecture: 'Architecture & Rules',
    security: 'Security & CVE Audit',
    mesh: 'Workspace Mesh',
    impact: 'Blast Radius Impact',
    diff: 'Branch Diff Delta',
    erd: 'Database ERD',
    infra: 'Infra Topology',
    handbook: 'Handbook Exporter',
  };

  return (
    <div className="app-shell">
      {/* Left Collapsible & Draggable Resizable Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab: any) => setActiveTab(tab)}
        analysis={analysis}
        repositoriesCount={repositories.length}
        architecture={architecture}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        width={sidebarWidth}
        onWidthChange={setSidebarWidth}
      />

      {/* Main Workspace Area with Dynamic Margin Left */}
      <div
        className={`app-main ${isSidebarCollapsed ? 'collapsed' : ''}`}
        style={{ marginLeft: isSidebarCollapsed ? '72px' : `${sidebarWidth}px` }}
      >
        {/* Sticky App Header Bar */}
        <Header
          repositories={repositories}
          activeRepo={activeRepo}
          onSelectRepo={handleSelectRepo}
          onOpenScanModal={() => setIsScanModalOpen(true)}
          onRefresh={fetchRepositories}
          isLoading={isLoading}
          activeTabLabel={tabLabels[activeTab] || 'Workspace'}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Workspace Content Body */}
        <div className="app-content">
          {/* Error Alert Message */}
          {error && (
            <div
              className="glass-panel"
              style={{
                padding: '1rem 1.25rem',
                borderLeft: '4px solid var(--accent-rose)',
                background: 'rgba(244, 63, 94, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: 'white',
              }}
            >
              <AlertCircle size={20} color="var(--accent-rose)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '0.875rem' }}>{error}</div>
              <button
                onClick={() => setError(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Active View Content */}
          {activeTab === 'agentic' && (
            <AgenticPlatformPanel
              activeRepoUrl={activeRepo?.rootPath || (activeRepo?.name ? `https://github.com/shatru123/${activeRepo.name}` : undefined)}
              activeBranch={activeRepo?.branch || 'main'}
            />
          )}
          {activeTab === 'ai' && (analysis ? <AiAssistantPanel repoId={analysis.repository.id} /> : null)}
          {activeTab === 'graph' && (analysis ? <GraphExplorer analysis={analysis} onSelectEntity={setSelectedEntity} /> : null)}
          {activeTab === 'runner' && (analysis ? <CodeRunnerPanel repoId={analysis.repository.id} /> : null)}
          {activeTab === 'flows' && (analysis ? <FlowExplorer flows={analysis.flows} /> : null)}
          {activeTab === 'apis' && (analysis ? <ApiExplorer apis={analysis.apis} /> : null)}
          {activeTab === 'databases' && (analysis ? <DatabaseExplorer databases={analysis.databases} /> : null)}
          {activeTab === 'events' && (analysis ? <EventExplorer events={analysis.events} /> : null)}
          {activeTab === 'packages' && (analysis ? <PackageExplorer packages={analysis.packages} /> : null)}
          {activeTab === 'architecture' && <ArchitecturePanel architecture={architecture} />}
          {activeTab === 'security' && (analysis ? <SecurityExplorer audit={analysis.securityAudit} /> : null)}
          {activeTab === 'mesh' && <MeshExplorer />}
          {activeTab === 'impact' && (analysis ? <ImpactExplorer repoId={analysis.repository.id} /> : null)}
          {activeTab === 'diff' && (analysis ? <DiffExplorer repoId={analysis.repository.id} /> : null)}
          {activeTab === 'erd' && (analysis ? <ErdExplorer repoId={analysis.repository.id} /> : null)}
          {activeTab === 'infra' && (analysis ? <InfrastructureExplorer repoId={analysis.repository.id} /> : null)}
          {activeTab === 'handbook' && (analysis ? <HandbookExporterView repoId={analysis.repository.id} /> : null)}

          {/* Fallback Onboarding State when no repository knowledge graph is loaded */}
          {!analysis && activeTab !== 'agentic' && (
            <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center' }}>
              <Sparkles size={42} color="var(--accent-purple)" style={{ marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Repository Knowledge Graph Loaded</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem', maxWidth: '500px', margin: '0 auto 1.25rem' }}>
                Connect a repository to extract AST knowledge graphs, REST APIs, DB flows, and architecture maps — or switch to the <strong>Agentic AI Platform</strong> tab to execute autonomous coding tasks.
              </p>
              <button onClick={() => setIsScanModalOpen(true)} className="btn-primary" style={{ padding: '0.8rem 1.75rem', fontSize: '0.95rem' }}>
                Connect Repository Knowledge Graph
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Entity Drawer Inspector */}
      <EntityDetailModal
        entity={selectedEntity}
        relationships={analysis?.relationships || []}
        onClose={() => setSelectedEntity(null)}
      />

      {/* Repository Scanner Modal */}
      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanComplete={handleScanComplete}
      />

      {/* Secret Admin Analytics Modal */}
      <AdminAnalyticsModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
};

export default App;
