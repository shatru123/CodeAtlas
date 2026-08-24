import React, { useState, useEffect } from 'react';
import { ArchitectureHandbook } from '../types/api';
import { apiService } from '../services/apiService';
import { FileText, Download, Copy, Check, BookOpen } from 'lucide-react';

interface HandbookExporterViewProps {
  repoId: string;
}

export const HandbookExporterView: React.FC<HandbookExporterViewProps> = ({ repoId }) => {
  const [handbook, setHandbook] = useState<ArchitectureHandbook | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchHandbook = async () => {
    setLoading(true);
    try {
      const data = await apiService.getHandbook(repoId);
      setHandbook(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandbook();
  }, [repoId]);

  if (!handbook) return null;

  const { repositoryName, markdownContent } = handbook;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${repositoryName}_Architecture_Handbook.md`;
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
      {/* Banner & Controls */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.12))', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <BookOpen size={24} color="var(--accent-indigo)" style={{ flexShrink: 0 }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'white' }}>Living Architecture Handbook & Exporter</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Auto-synthesizes a comprehensive technical specification handbook for developer onboarding and engineering audits.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            onClick={handleCopy}
            style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid var(--border-card)', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            {copied ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
            {copied ? 'Copied Markdown!' : 'Copy Handbook'}
          </button>

          <button
            onClick={handleDownloadMarkdown}
            style={{ background: 'var(--accent-indigo)', color: 'white', border: 'none', padding: '0.5rem 1.1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Download size={16} /> Export Markdown (.md)
          </button>
        </div>
      </div>

      {/* Markdown Preview Document */}
      <div className="glass-panel" style={{ padding: '1.75rem', background: 'rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid var(--border-card)', fontFamily: 'var(--font-code)', fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.6', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
        {markdownContent}
      </div>
    </div>
  );
};
