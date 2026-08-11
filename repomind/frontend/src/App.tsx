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
import { EntityDetailModal } from './components/EntityDetailModal';
import { apiService } from './services/apiService';
import { AnalysisResult, ArchitectureSummary, CodeEntity, RepositoryInfo } from './types/api';
import { Network, Layers, Globe, Database, Radio, Shield, GitCommit, Package, Zap, Sparkles, FolderGit2 } from 'lucide-react';

export const App: React.FC = () => {
  const [repositories, setRepositories] = useState<RepositoryInfo[]>([]);
  const [activeRepo, setActiveRepo] = useState<RepositoryInfo | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [architecture, setArchitecture] = useState<ArchitectureSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'flows' | 'apis' | 'databases' | 'events' | 'packages' | 'architecture'>('graph');
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
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem' }}>
      <Header
        repositories={repositories}
        activeRepo={activeRepo}
        onSelectRepo={loadRepoAnalysis}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        onRefresh={fetchRepositories}
        isLoading={isLoading}
      />

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
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-card)', marginBottom: '1.5rem', gap: '1.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'graph', label: 'Knowledge Graph', icon: Network, count: analysis.entities.length },
              { id: 'flows', label: 'Functional Flows', icon: Zap, count: analysis.flows.length },
              { id: 'apis', label: 'REST APIs', icon: Globe, count: analysis.apis.length },
              { id: 'databases', label: 'Database & ORM', icon: Database, count: analysis.databases.length },
              { id: 'events', label: 'Messaging Events', icon: Radio, count: analysis.events.length },
              { id: 'packages', label: 'Packages & Libraries', icon: Package, count: analysis.packages.length },
              { id: 'architecture', label: 'Architecture & Rules', icon: Shield, count: architecture?.violations.length || 0 },
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
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={18} color={isActive ? 'var(--accent-indigo)' : 'var(--text-muted)'} />
                  <span>{tab.label}</span>
                  <span style={{ background: isActive ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.08)', color: 'white', padding: '0.1rem 0.45rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '700' }}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active View Content */}
          {activeTab === 'graph' && <GraphExplorer analysis={analysis} onSelectEntity={setSelectedEntity} />}
          {activeTab === 'flows' && <FlowExplorer flows={analysis.flows} />}
          {activeTab === 'apis' && <ApiExplorer apis={analysis.apis} />}
          {activeTab === 'databases' && <DatabaseExplorer databases={analysis.databases} />}
          {activeTab === 'events' && <EventExplorer events={analysis.events} />}
          {activeTab === 'packages' && <PackageExplorer packages={analysis.packages} />}
          {activeTab === 'architecture' && <ArchitecturePanel architecture={architecture} />}
        </>
      )}

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
    </div>
  );
};
