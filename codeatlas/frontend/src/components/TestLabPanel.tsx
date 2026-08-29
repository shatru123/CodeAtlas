import React, { useState, useEffect } from 'react';
import { FlaskConical, Play, Sparkles, CheckCircle2, Code2, RefreshCw, FileCode, Shield } from 'lucide-react';
import { apiService } from '../services/apiService';
import { MetricTooltip } from './MetricTooltip';
import { ContextualHelpBox } from './ContextualHelpBox';

interface TestLabPanelProps {
  repoId: string;
}

export const TestLabPanel: React.FC<TestLabPanelProps> = ({ repoId }) => {
  const [suites, setSuites] = useState<any[]>([]);
  const [selectedSuite, setSelectedSuite] = useState<any>(null);
  const [targetClass, setTargetClass] = useState('OrderService');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchSuites();
  }, [repoId]);

  const fetchSuites = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getTestLabSuites(repoId);
      setSuites(data);
      if (data.length > 0) setSelectedSuite(data[0]);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClass.trim()) return;

    setIsGenerating(true);
    try {
      const newSuite = await apiService.generateTestSuite(repoId, targetClass);
      setSuites((prev) => [newSuite, ...prev]);
      setSelectedSuite(newSuite);
      setTargetClass('');
    } catch {
      // Fallback
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-purple)' }} />
        <div>Analyzing AST Class Definitions & Synthesizing Executable Unit Test Suites...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Contextual Help Drawer */}
      <ContextualHelpBox
        title="What is Automated Test Lab & Test Synthesis?"
        description="Automated Test Lab inspects your repository's AST class definitions, discovers methods lacking unit test coverage, and synthesizes executable unit tests (xUnit/Moq) with mocked dependencies to ensure 100% branch coverage with zero side effects."
      />

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(76, 29, 149, 0.5))', border: '1.5px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(168,85,247,0.4)' }}>
              <FlaskConical size={24} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>
                Automated Test Suite Synthesizer (<MetricTooltip term="Test Lab" explanation="AI-powered test suite generator that inspects AST class definitions and produces isolated xUnit/Moq unit tests with mocked side-effects." />)
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Synthesize unit & integration tests for uncovered classes with dependency mocking and 1-click execution.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Class name (e.g. OrderService)"
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', padding: '0.45rem 0.75rem', borderRadius: '6px', color: 'white', fontSize: '0.82rem', outline: 'none' }}
            />
            <button type="submit" disabled={isGenerating} className="btn-primary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}>
              {isGenerating ? <RefreshCw size={15} className="spin" /> : <Sparkles size={15} />}
              <span>Synthesize Tests</span>
            </button>
          </form>
        </div>
      </div>

      {/* Main Grid: Test Suites List vs Selected Test Code */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem' }}>
        {/* Left: Test Suites Sidebar */}
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            SYNTHESIZED TEST SUITES ({suites.length})
          </div>
          {suites.map((suite, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedSuite(suite)}
              style={{
                padding: '0.85rem',
                borderRadius: '8px',
                background: selectedSuite?.targetClassName === suite.targetClassName ? 'rgba(168,85,247,0.18)' : 'rgba(255,255,255,0.03)',
                border: selectedSuite?.targetClassName === suite.targetClassName ? '1.5px solid var(--accent-purple)' : '1px solid var(--border-card)',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{suite.targetClassName}Tests</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-purple)', background: 'rgba(168,85,247,0.2)', padding: '0.1rem 0.4rem', borderRadius: '6px' }}>{suite.framework}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                📄 {suite.filePath}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', marginTop: '0.4rem', fontWeight: '700' }}>
                ✓ {suite.generatedTestCasesCount} Test Cases Synthesized
              </div>
            </div>
          ))}
        </div>

        {/* Right: Executable Code Preview */}
        {selectedSuite && (
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', margin: 0 }}>{selectedSuite.targetClassName}Tests.cs</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{selectedSuite.rationale}</div>
              </div>
              <button className="btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                <Play size={14} /> Run Test Suite
              </button>
            </div>

            {/* Mocked Dependencies Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700' }}>Mocked Dependencies:</span>
              {selectedSuite.mockedDependencies?.map((dep: string, i: number) => (
                <span key={i} style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(99,102,241,0.3)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700' }}>
                  {dep}
                </span>
              ))}
            </div>

            {/* Code Block */}
            <pre style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-card)', padding: '1rem', borderRadius: '10px', color: '#c084fc', fontSize: '0.82rem', fontFamily: 'var(--font-code)', overflowX: 'auto' }}>
              {selectedSuite.testCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
