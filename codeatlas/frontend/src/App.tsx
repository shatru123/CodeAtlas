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
} from 'lucide-react';

export const App: React.FC = () => {
  const [repositories, setRepositories] = useState<RepositoryInfo[]>([]);
  const [activeRepo, setActiveRepo] = useState<RepositoryInfo | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [architecture, setArchitecture] = useState<ArchitectureSummary | null>(null);
  const [activeTab, setActiveTab] = useState<
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
  >('graph');
  const [selectedEntity, setSelectedEntity] = useState<CodeEntity | null>(null);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
          <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.3rem' }}>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'white' }}>{analysis.repository.name}</h2>
                  <span className="badge badge-get" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent-indigo)' }}>
                    {analysis.repository.source === 0 ? 'Local Repository' : 'GitHub Repository'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>
                    Branch: <strong style={{ color: 'white' }}>{analysis.repository.branch || 'main'}</strong>
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <FolderGit2 size={14} color="var(--accent-cyan)" />
                    {analysis.repository.rootPath}
                  </span>
                  {analysis.repository.commitHash && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <GitCommit size={14} color="var(--accent-purple)" />
                      SHA: {analysis.repository.commitHash.substring(0, 8)}
                    </span>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>{analysis.entities.length}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AST Entities</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>{analysis.apis.length}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>REST APIs</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-amber)' }}>{analysis.packages.length}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Packages</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
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

        {/* Workspace Tabs */}
        {analysis && (
          <>
            <div className="tabs-scroll-container">
              {[
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
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      borderBottom: isActive ? '3px solid var(--accent-indigo)' : '3px solid transparent',
                      padding: '0.75rem 0.25rem',
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

            {/* Active View Content */}
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
          </>
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
