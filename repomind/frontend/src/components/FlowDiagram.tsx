import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw, Copy, Check, Code, Maximize2, Sparkles } from 'lucide-react';

interface FlowDiagramProps {
  id: string;
  markup: string;
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({ id, markup }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      themeVariables: {
        darkModeBanner: true,
        fontFamily: 'Inter, system-ui, sans-serif',
        primaryColor: '#1e1b4b',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#6366f1',
        lineColor: '#38bdf8',
        secondaryColor: '#2e1065',
        tertiaryColor: '#0f172a',
        edgeLabelBackground: '#0b0f17',
      },
      flowchart: {
        curve: 'basis',
        htmlLabels: true,
        useMaxWidth: false,
        padding: 20,
      },
    });

    const renderDiagram = async () => {
      if (!containerRef.current || !markup) return;
      try {
        setError(null);
        const uniqueId = `mermaid-${id.replace(/[^a-zA-Z0-9]/g, '')}-${Math.floor(Math.random() * 10000)}`;
        const { svg } = await mermaid.render(uniqueId, markup);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          // Apply custom styling to SVG and prevent label truncation/overlap
          const svgEl = containerRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.width = '100%';
            svgEl.style.height = 'auto';
            svgEl.style.maxHeight = '650px';

            const styleNode = document.createElement('style');
            styleNode.textContent = `
              .mermaid .node foreignObject { overflow: visible !important; }
              .mermaid .node label { word-break: break-word !important; white-space: normal !important; font-family: Inter, sans-serif !important; font-size: 13px !important; }
              .mermaid .edgeLabel { background-color: #0b0f17 !important; border-radius: 4px; padding: 2px 6px; font-size: 11px !important; color: #38bdf8 !important; }
            `;
            svgEl.appendChild(styleNode);
          }
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        setError('Failed to render Mermaid diagram');
      }
    };

    renderDiagram();
  }, [id, markup]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(markup);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="glass-panel"
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? '1.5rem' : 'auto',
        zIndex: isFullscreen ? 1200 : 1,
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        background: isFullscreen ? '#0b0f17' : 'rgba(15, 23, 42, 0.65)',
        border: '1px solid var(--border-card)',
        boxShadow: isFullscreen ? '0 0 50px rgba(0,0,0,0.8)' : 'var(--shadow-card)',
      }}
    >
      {/* Diagram Controls Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color="var(--accent-indigo)" />
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white' }}>Mermaid Sequence Flowchart</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2))}
            title="Zoom In"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-card)', color: 'white', padding: '0.3rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
            title="Zoom Out"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-card)', color: 'white', padding: '0.3rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => setZoom(1)}
            title="Reset Zoom"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-card)', color: 'white', padding: '0.3rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => setShowCode(!showCode)}
            title="Toggle Mermaid Markup"
            style={{ background: showCode ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.06)', border: '1px solid var(--border-card)', color: 'white', padding: '0.3rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Code size={14} />
            {showCode ? 'View Diagram' : 'Mermaid Code'}
          </button>
          <button
            onClick={handleCopyCode}
            title="Copy Markup"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-card)', color: 'white', padding: '0.3rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Fullscreen"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-card)', color: 'white', padding: '0.3rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Code View or SVG Canvas */}
      {showCode ? (
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-card)', overflowX: 'auto' }}>
          <pre style={{ fontFamily: 'var(--font-code)', fontSize: '0.82rem', color: '#c7d2fe', margin: 0, whiteSpace: 'pre-wrap' }}>
            {markup}
          </pre>
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', background: 'rgba(244,63,94,0.1)', color: '#fecdd3', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-code)' }}>
          {error}
        </div>
      ) : (
        <div style={{ overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '280px', padding: '1rem' }}>
          <div
            ref={containerRef}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          />
        </div>
      )}
    </div>
  );
};
