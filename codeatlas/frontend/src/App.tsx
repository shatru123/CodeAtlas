import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScanModal } from './components/ScanModal';
import { GraphExplorer } from './components/GraphExplorer';
import { ApiExplorer } from './components/ApiExplorer';
import { DatabaseExplorer } from './components/DatabaseExplorer';
import { EventExplorer } from './components/EventExplorer';
import { PackageExplorer } from './components/PackageExplorer';
import { FlowExplorer } from './components/FlowExplorer';
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
import { EntityDetailModal } from './components/EntityDetailModal';
import { apiService } from './services/apiService';
import { AnalysisResult, ArchitectureSummary, CodeEntity, RepositoryInfo } from './types/api';
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
} from 'lucide-react';

export const App: React.FC = () => {
  const [repositories, setRepositories] = useState<RepositoryInfo[]>([]);
  const [activeRepo, setActiveRepo] = useState<RepositoryInfo | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [architecture, setArchitecture] = useState<ArchitectureSummary | null>(null);
  const [activeTab, setActiveTab] = useState<
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
  >('ai');
  const [selectedEntity, setSelectedEntity] = useState<CodeEntity | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const tabsRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkTabScroll = () => {
    if (tabsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkTabScroll();
    const el = tabsRef.current;
    if (el) {
      el.addEventListener('scroll', checkTabScroll);
      window.addEventListener('resize', checkTabScroll);
      return () => {
        el.removeEventListener('scroll', checkTabScroll);
        window.removeEventListener('resize', checkTabScroll);
      };
    }
  }, [analysis]);

  const scrollTabs = (dir: 'left' | 'right') => {
    if (tabsRef.current) {
      const offset = dir === 'left' ? -320 : 320;
      tabsRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const fetchRepositories = async () => {
    setIsLoading(true);
    try {
      const list = await apiService.listRepositories();
      setRepositories(list);
      if (list.length > 0 && !activeRepo) {
        loadRepoAnalysis(list[0]);
      } else if (list.length === 0) {
        autoScanLocal();
      }
    } catch {
      autoScanLocal();
    } finally {
      setIsLoading(false);
    }
  };

  const autoScanLocal = async () => {
    try {
      const res = await apiService.scanLocalRepository({ path: '~/Shatru/Learning/Projects/CodeAtlas' });
      setRepositories([res.repository]);
      setActiveRepo(res.repository);
      setAnalysis(res);
      const arch = await apiService.getArchitecture(res.repository.id);
      setArchitecture(arch);
    } catch {
      // Fallback
    }
  };

  const loadRepoAnalysis = async (repo: RepositoryInfo) => {
    setIsLoading(true);
    setActiveRepo(repo);
    try {
      const result = await apiService.getRepository(repo.id);
      setAnalysis(result);
      const arch = await apiService.getArchitecture(repo.id);
      setArchitecture(arch);
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const handleScanComplete = (result: AnalysisResult) => {
    setRepositories((prev) => [result.repository, ...prev.filter((r) => r.id !== result.repository.id)]);
    setActiveRepo(result.repository);
    setAnalysis(result);
    apiService.getArchitecture(result.repository.id).then(setArchitecture).catch(() => {});
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header
        repositories={repositories}
        activeRepo={activeRepo}
        onSelectRepo={loadRepoAnalysis}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        onRefresh={fetchRepositories}
        isLoading={isLoading}
      />

      <div style={{ flex: 1 }}>
        {/* Main Repository Banner */}
        {analysis ? (
          <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', marginBottom: '1.5rem', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', minWidth: 0 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem', flexWrap: 'wrap', minWidth: 0 }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{analysis.repository.name}</h2>
                  <span className="badge badge-get" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent-indigo)', flexShrink: 0 }}>
                    {analysis.repository.source === 0 ? 'Local Repository' : 'GitHub Repository'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)', flexShrink: 0 }}>
                    Branch: <strong style={{ color: 'white' }}>{analysis.repository.branch || 'main'}</strong>
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', wordBreak: 'break-all', overflowWrap: 'anywhere', lineHeight: '1.3' }}>
                    <FolderGit2 size={14} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                    {analysis.repository.rootPath}
                  </span>
                  {analysis.repository.commitHash && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                      <GitCommit size={14} color="var(--accent-purple)" />
                      SHA: {analysis.repository.commitHash.substring(0, 8)}
                    </span>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="metrics-responsive-grid">
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center', minWidth: 0 }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{analysis.entities.length}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AST Entities</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center', minWidth: 0 }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>{analysis.apis.length}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>REST APIs</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center', minWidth: 0 }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-amber)' }}>{analysis.packages.length}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Packages</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center', minWidth: 0 }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-purple)' }}>{analysis.flows.length}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Flows</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <Sparkles size={42} color="var(--accent-purple)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>No Repositories Connected Yet</h2>
            <button onClick={() => setIsScanModalOpen(true)} className="btn-primary" style={{ padding: '0.8rem 1.75rem', fontSize: '0.95rem' }}>
              Connect Your First Repository
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
                    <optgroup label="AI Assistant & Execution">
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

      {/* Scan Modal */}
      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanComplete={handleScanComplete}
      />

      {/* Premium Glassmorphic Footer */}
      <footer
        className="glass-panel"
        style={{
          marginTop: '3rem',
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(30, 41, 59, 0.7))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            <User size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
              Created By
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              Shatrughna Ambhore
              <Heart size={14} color="var(--accent-rose)" fill="var(--accent-rose)" />
            </div>
          </div>
        </div>

        {/* Contact Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <a
            href="tel:+919604466334"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-cyan)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <Phone size={15} color="var(--accent-cyan)" />
            <span>+91 9604466334</span>
          </a>

          <a
            href="mailto:ambhoreshatrughna@gmail.com"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.85rem',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-emerald)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <Mail size={15} color="var(--accent-emerald)" />
            <span>ambhoreshatrughna@gmail.com</span>
          </a>

          <a
            href="https://github.com/shatru123"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-card)',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.83rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-indigo)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-card)')}
          >
            <Github size={15} color="var(--accent-indigo)" />
            <span>GitHub</span>
          </a>

          <a
            href="https://www.linkedin.com/in/shatrughna-ambhore-001b4a129/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.83rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-cyan)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)')}
          >
            <Linkedin size={15} color="var(--accent-cyan)" />
            <span>LinkedIn</span>
          </a>
        </div>
      </footer>
    </div>
  );
};
