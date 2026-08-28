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

  const [selectedEntity, setSelectedEntity] = useState<CodeEntity | null>(null);
  const [activeTab, setActiveTab] = useState<
    | 'doctor'
    | 'modernize'
    | 'ai'
    | 'graph'
    | 'flows'
    | 'apis'
    | 'databases'
    | 'events'
    | 'packages'
    | 'architecture'
    | 'security'
    | 'mesh'
    | 'impact'
    | 'diff'
    | 'erd'
    | 'infra'
    | 'handbook'
    | 'runner'
  >('doctor');

  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollTabs = (dir: 'left' | 'right') => {
    if (tabsRef.current) {
      const offset = dir === 'left' ? -320 : 320;
      tabsRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

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

        {/* Workspace Tabs Header & Switcher Toolbar */}
        {analysis && (
          <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
            {/* Scroll & Jump Helper Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-cyan)' }}>
                  Workspace Features (15 Views)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {/* Direct View Jump Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', padding: '0.25rem 0.65rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', whiteSpace: 'nowrap' }}>Quick Jump:</span>
                  <select
                    value={activeTab}
                    onChange={(e) => {
                      const tabId = e.target.value as any;
                      setActiveTab(tabId);
                      setTimeout(() => {
                        const btn = document.getElementById(`tab-btn-${tabId}`);
                        if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                      }, 50);
                    }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.8rem', fontWeight: '700', outline: 'none', cursor: 'pointer', maxWidth: '210px' }}
                  >
                    <optgroup label="AI Assistant & Quality Doctor">
                      <option value="doctor" style={{ background: '#161b26', color: '#fff' }}>🩺 AI Tech Debt Doctor</option>
                      <option value="modernize" style={{ background: '#161b26', color: '#fff' }}>🚀 .NET 8 Migration Assistant</option>
                      <option value="ai" style={{ background: '#161b26', color: '#fff' }}>🤖 AI Code Assistant (RAG Chat)</option>
                      <option value="runner" style={{ background: '#161b26', color: '#fff' }}>▶️ Code Runner (Terminal)</option>
                      <option value="flows" style={{ background: '#161b26', color: '#fff' }}>⚡ Functional Flows</option>
                      <option value="apis" style={{ background: '#161b26', color: '#fff' }}>🌐 REST APIs Catalog</option>
                      <option value="events" style={{ background: '#161b26', color: '#fff' }}>📻 Messaging Events</option>
                    </optgroup>
                    <optgroup label="Architecture & Topology">
                      <option value="graph" style={{ background: '#161b26', color: '#fff' }}>🔍 Knowledge Graph</option>
                      <option value="architecture" style={{ background: '#161b26', color: '#fff' }}>🛡️ Architecture & Rules</option>
                      <option value="mesh" style={{ background: '#161b26', color: '#fff' }}>🌐 Workspace Mesh</option>
                      <option value="infra" style={{ background: '#161b26', color: '#fff' }}>📦 Infra Topology</option>
                    </optgroup>
                    <optgroup label="Impact, Diff & Security">
                      <option value="impact" style={{ background: '#161b26', color: '#fff' }}>💥 Blast Radius Impact</option>
                      <option value="diff" style={{ background: '#161b26', color: '#fff' }}>🔀 Branch Diff Delta</option>
                      <option value="security" style={{ background: '#161b26', color: '#fff' }}>🔒 Security & CVE Audit</option>
                    </optgroup>
                    <optgroup label="Database & Docs">
                      <option value="databases" style={{ background: '#161b26', color: '#fff' }}>🗄️ Database & ORM</option>
                      <option value="erd" style={{ background: '#161b26', color: '#fff' }}>📊 Database ERD</option>
                      <option value="packages" style={{ background: '#161b26', color: '#fff' }}>📦 Packages & Libraries</option>
                      <option value="handbook" style={{ background: '#161b26', color: '#fff' }}>📖 Handbook Exporter</option>
                    </optgroup>
                  </select>
                </div>

                <button
                  onClick={() => setIsCiCdModalOpen(true)}
                  className="btn-primary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '0.35rem' }}
                >
                  <Workflow size={14} />
                  <span>Export CI/CD GitHub Action</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-indigo)', fontSize: '0.75rem', fontWeight: '600', background: 'rgba(99, 102, 241, 0.12)', padding: '0.2rem 0.65rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <span>Scroll tabs or use arrows</span>
                  <ChevronRight size={14} className="pulse-arrow" />
                </div>
              </div>
            </div>

            {/* Tab Container with Left & Right Arrow Buttons */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {/* Left Floating Arrow Button */}
              {canScrollLeft && (
                <button
                  onClick={() => scrollTabs('left')}
                  style={{
                    position: 'absolute',
                    left: 0,
                    zIndex: 10,
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1.5px solid var(--accent-indigo)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
                  }}
                  title="Scroll Left"
                >
                  <ChevronLeft size={18} />
                </button>
              )}

              {/* Scrollable Tabs Container */}
              <div
                ref={tabsRef}
                className="tabs-scroll-container"
                style={{
                  paddingLeft: canScrollLeft ? '40px' : '0px',
                  paddingRight: canScrollRight ? '40px' : '0px',
                  transition: 'padding 0.2s ease',
                }}
              >
                {[
                  { id: 'doctor', label: 'AI Tech Debt Doctor', icon: Stethoscope, count: '🩺 Doctor' },
                  { id: 'modernize', label: 'Modernization Assistant', icon: Rocket, count: '🚀 .NET 8' },
                  { id: 'ai', label: 'AI Code Assistant', icon: Bot, count: '🤖 AI' },
                  { id: 'graph', label: 'Knowledge Graph', icon: Network, count: analysis.entities.length },
                  { id: 'runner', label: 'Code Runner', icon: PlayCircle, count: '▶ Run' },
                  { id: 'flows', label: 'Functional Flows', icon: Zap, count: analysis.flows.length },
                  { id: 'apis', label: 'REST APIs', icon: Globe, count: analysis.apis.length },
                  { id: 'databases', label: 'Database & ORM', icon: Database, count: analysis.databases.length },
                  { id: 'events', label: 'Messaging Events', icon: Radio, count: analysis.events.length },
                  { id: 'packages', label: 'Packages & Libraries', icon: Package, count: analysis.packages.length },
                  { id: 'architecture', label: 'Architecture & Rules', icon: Shield, count: architecture ? (architecture.violations.length > 0 ? `${architecture.violations.length} Alerts` : 'Clean') : '4 Rules' },
                  { id: 'security', label: 'Security & CVE Audit', icon: ShieldAlert, count: analysis.securityAudit ? `${analysis.securityAudit.securityScore}/100` : 'Audit' },
                  { id: 'mesh', label: 'Workspace Mesh', icon: Share2, count: `${repositories.length} Repos` },
                  { id: 'impact', label: 'Blast Radius', icon: Zap, count: 'Impact' },
                  { id: 'diff', label: 'Branch Diff', icon: GitCompare, count: 'Delta' },
                  { id: 'erd', label: 'Database ERD', icon: Table, count: 'ERD' },
                  { id: 'infra', label: 'Infra Topology', icon: Box, count: 'Docker/K8s' },
                  { id: 'handbook', label: 'Handbook Exporter', icon: BookOpen, count: 'Docs' },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`tab-btn-${tab.id}`}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        const btn = document.getElementById(`tab-btn-${tab.id}`);
                        if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                      }}
                      style={{
                        background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        border: 'none',
                        borderBottom: isActive ? '3px solid var(--accent-indigo)' : '3px solid transparent',
                        padding: '0.75rem 0.6rem',
                        borderRadius: '6px 6px 0 0',
                        color: isActive ? 'white' : 'var(--text-muted)',
                        fontWeight: isActive ? '700' : '500',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.45rem',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={17} color={isActive ? 'var(--accent-indigo)' : 'var(--text-muted)'} />
                      <span>{tab.label}</span>
                      <span style={{ background: isActive ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.08)', color: 'white', padding: '0.1rem 0.45rem', borderRadius: '1rem', fontSize: '0.68rem', fontWeight: '700' }}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Floating Arrow Button */}
              {canScrollRight && (
                <button
                  onClick={() => scrollTabs('right')}
                  style={{
                    position: 'absolute',
                    right: 0,
                    zIndex: 10,
                    background: 'rgba(15, 23, 42, 0.92)',
                    border: '1.5px solid var(--accent-indigo)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
                  }}
                  title="Scroll Right"
                >
                  <ChevronRight size={18} />
                </button>
              )}
            </div>

            {/* Active View Content */}
            {activeTab === 'doctor' && <TechDebtDoctorPanel repoId={analysis.repository.id} />}
            {activeTab === 'modernize' && <ModernizationPanel repoId={analysis.repository.id} />}
            {activeTab === 'ai' && <AiAssistantPanel repoId={analysis.repository.id} />}
            {activeTab === 'graph' && <GraphExplorer analysis={analysis} onSelectEntity={setSelectedEntity} />}
            {activeTab === 'runner' && <CodeRunnerPanel repoId={analysis.repository.id} />}
            {activeTab === 'flows' && <FlowExplorer flows={analysis.flows} />}
            {activeTab === 'apis' && <ApiExplorer apis={analysis.apis} />}
            {activeTab === 'databases' && <DatabaseExplorer databases={analysis.databases} />}
            {activeTab === 'events' && <EventExplorer events={analysis.events} />}
            {activeTab === 'packages' && <PackageExplorer packages={analysis.packages} />}
            {activeTab === 'architecture' && <ArchitecturePanel architecture={architecture} />}
            {activeTab === 'security' && <SecurityExplorer audit={analysis.securityAudit} />}
            {activeTab === 'mesh' && <MeshExplorer />}
            {activeTab === 'impact' && <ImpactExplorer repoId={analysis.repository.id} />}
            {activeTab === 'diff' && <DiffExplorer repoId={analysis.repository.id} />}
            {activeTab === 'erd' && <ErdExplorer repoId={analysis.repository.id} />}
            {activeTab === 'infra' && <InfrastructureExplorer repoId={analysis.repository.id} />}
            {activeTab === 'handbook' && <HandbookExporterView repoId={analysis.repository.id} />}
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
