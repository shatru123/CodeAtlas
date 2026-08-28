import React, { useEffect, useState, useRef } from 'react';
import { Header } from './components/Header';
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
import { HandbookExporterView } from './components/HandbookExporterView';
import { CodeRunnerPanel } from './components/CodeRunnerPanel';
import { AiAssistantPanel } from './components/AiAssistantPanel';
import { TopPillarNav, PillarId } from './components/TopPillarNav';
import { SystemExplorerPanel } from './components/SystemExplorerPanel';
import { AgentTaskCenterPanel } from './components/AgentTaskCenterPanel';
import { RcaEnginePanel } from './components/RcaEnginePanel';
import { EngineeringHealthRadarPanel } from './components/EngineeringHealthRadarPanel';
import { MultiRepoWorkspacePanel } from './components/MultiRepoWorkspacePanel';
import { UiPreviewSandboxPanel } from './components/UiPreviewSandboxPanel';
import { OnboardingTourModal } from './components/OnboardingTourModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { TechDebtDoctorPanel } from './components/TechDebtDoctorPanel';
import { ModernizationPanel } from './components/ModernizationPanel';
import { CiCdExporterModal } from './components/CiCdExporterModal';
import { AdminAnalyticsModal } from './components/AdminAnalyticsModal';
import { apiService } from './services/apiService';
import {
  RepositoryInfo,
  AnalysisResult,
  CodeEntity,
  ArchitectureSummary,
} from './types/api';
import {
  Network,
  Globe,
  Database,
  Radio,
  Shield,
  GitCommit,
  Package,
  Zap,
  Sparkles,
  FolderGit2,
  ShieldAlert,
  Share2,
  GitCompare,
  Box,
  BookOpen,
  Table,
  PlayCircle,
  Phone,
  Mail,
  Github,
  Linkedin,
  Heart,
  User,
  ChevronLeft,
  ChevronRight,
  Bot,
  Lock,
  Stethoscope,
  Rocket,
  Workflow,
  AlertCircle,
} from 'lucide-react';

export const App: React.FC = () => {
  const [repositories, setRepositories] = useState<RepositoryInfo[]>([]);
  const [activeRepo, setActiveRepo] = useState<RepositoryInfo | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [architecture, setArchitecture] = useState<ArchitectureSummary | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isCiCdModalOpen, setIsCiCdModalOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  const [selectedEntity, setSelectedEntity] = useState<CodeEntity | null>(null);
  const [activePillar, setActivePillar] = useState<PillarId>('understand');
  const [activeSubTab, setActiveSubTab] = useState<string>('system_explorer');

  // Load Repositories on startup
  useEffect(() => {
    fetchRepositories();
    apiService.recordVisit();
  }, []);

  // Global Keyboard shortcuts listener (⌘K, /, Ctrl+Shift+A, G G, G A, G T)
  useEffect(() => {
    let lastKey = '';
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K or / -> Open Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminModalOpen(true);
      } else if (e.key.toLowerCase() === 'g' && lastKey === 'g') {
        setActivePillar('understand');
        setActiveSubTab('graph');
      } else if (e.key.toLowerCase() === 'a' && lastKey === 'g') {
        setActivePillar('architecture');
        setActiveSubTab('architecture');
      } else if (e.key.toLowerCase() === 't' && lastKey === 'g') {
        setActivePillar('build');
        setActiveSubTab('agent_tasks');
      }
      lastKey = e.key.toLowerCase();
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-main)', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <Header
        repositories={repositories}
        activeRepo={activeRepo}
        onSelectRepo={handleSelectRepo}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        onRefresh={fetchRepositories}
        isLoading={isLoading}
        activeTabLabel="CodeAtlas Workspace"
        isSidebarCollapsed={false}
        onToggleSidebar={() => {}}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
      />

      <div style={{ flex: 1, marginTop: '1.5rem' }}>
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
              marginBottom: '1rem',
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

        {/* CodeAtlas 3.0 Flagship 5-Pillar Navigation Header & View Switcher */}
        {analysis && (
          <div>
            <TopPillarNav
              activePillar={activePillar}
              onSelectPillar={setActivePillar}
              activeSubTab={activeSubTab}
              onSelectSubTab={setActiveSubTab}
            />

            {/* Active View Renderer */}
            {activeSubTab === 'system_explorer' && <SystemExplorerPanel repoId={analysis.repository.id} />}
            {activeSubTab === 'ui_preview' && <UiPreviewSandboxPanel repoId={analysis.repository.id} />}
            {activeSubTab === 'agent_tasks' && <AgentTaskCenterPanel repoId={analysis.repository.id} />}
            {activeSubTab === 'graph' && <GraphExplorer analysis={analysis} onSelectEntity={setSelectedEntity} />}
            {activeSubTab === 'apis' && <ApiExplorer apis={analysis.apis} />}
            {activeSubTab === 'databases' && <DatabaseExplorer databases={analysis.databases} />}
            {activeSubTab === 'events' && <EventExplorer events={analysis.events} />}
            {activeSubTab === 'flows' && <FlowExplorer flows={analysis.flows} />}
            {activeSubTab === 'infra' && <InfrastructureExplorer repoId={analysis.repository.id} />}
            {activeSubTab === 'ai' && <AiAssistantPanel repoId={analysis.repository.id} />}
            {activeSubTab === 'runner' && <CodeRunnerPanel repoId={analysis.repository.id} />}
            {activeSubTab === 'modernize' && <ModernizationPanel repoId={analysis.repository.id} />}
            {activeSubTab === 'rca' && <RcaEnginePanel repoId={analysis.repository.id} />}
            {activeSubTab === 'telemetry' && <ApiExplorer apis={analysis.apis} />}
            {activeSubTab === 'impact' && <ImpactExplorer repoId={analysis.repository.id} />}
            {activeSubTab === 'diff' && <DiffExplorer repoId={analysis.repository.id} />}
            {activeSubTab === 'architecture' && <ArchitecturePanel architecture={architecture} />}
            {activeSubTab === 'mesh' && <MultiRepoWorkspacePanel repoId={analysis.repository.id} />}
            {activeSubTab === 'erd' && <ErdExplorer repoId={analysis.repository.id} />}
            {activeSubTab === 'handbook' && <HandbookExporterView repoId={analysis.repository.id} />}
            {activeSubTab === 'doctor' && <EngineeringHealthRadarPanel repoId={analysis.repository.id} />}
            {activeSubTab === 'security' && <SecurityExplorer audit={analysis.securityAudit} />}
            {activeSubTab === 'packages' && <PackageExplorer packages={analysis.packages} />}
          </div>
        )}
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

      {/* Product Guided Onboarding Tour Modal */}
      <OnboardingTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSelectTab={(pillar, subTab) => {
          setActivePillar(pillar as any);
          setActiveSubTab(subTab);
        }}
      />

      {/* Global Command Palette Modal (⌘K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectAction={(pillar, subTab) => {
          setActivePillar(pillar as any);
          setActiveSubTab(subTab);
        }}
      />

      {/* CI/CD GitHub Action Workflow Exporter Modal */}
      {analysis && (
        <CiCdExporterModal
          isOpen={isCiCdModalOpen}
          repoId={analysis.repository.id}
          onClose={() => setIsCiCdModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
