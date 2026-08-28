import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Download, Copy, Check, Terminal, FileCode } from 'lucide-react';
import { apiService } from '../services/apiService';

interface CiCdExporterModalProps {
  isOpen: boolean;
  repoId: string;
  onClose: () => void;
}

export const CiCdExporterModal: React.FC<CiCdExporterModalProps> = ({ isOpen, repoId, onClose }) => {
  const [workflowContent, setWorkflowContent] = useState('');
  const [fileName, setFileName] = useState('codeatlas-arch-guard.yml');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen && repoId) {
      apiService.getCiWorkflow(repoId).then((res) => {
        setWorkflowContent(res.content);
        setFileName(res.yamlFileName);
      }).catch(() => {});
    }
  }, [isOpen, repoId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(workflowContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([workflowContent], { type: 'text/yaml' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '820px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#0d111a', border: '1.5px solid var(--accent-indigo)', borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ background: '#111827', padding: '1.1rem 1.5rem', borderBottom: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #38bdf8)', padding: '0.45rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>GitHub Actions Architecture Guard Generator</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automate clean architecture AST compliance in your CI/CD pipelines</p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-muted)', padding: '0.4rem', borderRadius: '50%', cursor: 'cursor' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileCode size={16} /> .github/workflows/{fileName}
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button onClick={handleCopy} className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                <span>{isCopied ? 'Copied!' : 'Copy YAML'}</span>
              </button>

              <button onClick={handleDownload} className="btn-primary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem' }}>
                <Download size={14} /> Download .yml Workflow
              </button>
            </div>
          </div>

          <pre style={{ background: '#0a0d14', color: '#38bdf8', padding: '1.25rem', borderRadius: '12px', fontSize: '0.83rem', fontFamily: 'var(--font-code)', overflowX: 'auto', border: '1px solid var(--border-card)', margin: 0 }}>
            {workflowContent}
          </pre>
        </div>
      </div>
    </div>
  );
};
