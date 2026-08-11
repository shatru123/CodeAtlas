import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface FlowDiagramProps {
  id: string;
  markup: string;
}

export const FlowDiagram: React.FC<FlowDiagramProps> = ({ id, markup }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkModeBanner: true,
        fontFamily: 'Inter, sans-serif',
        primaryColor: '#6366f1',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#818cf8',
        lineColor: '#38bdf8',
        secondaryColor: '#a855f7',
        tertiaryColor: '#161b26',
      },
      flowchart: {
        curve: 'basis',
        htmlLabels: true,
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
        }
      } catch (err: any) {
        console.error('Mermaid render error:', err);
        setError('Failed to render Mermaid diagram');
      }
    };

    renderDiagram();
  }, [id, markup]);

  if (error) {
    return (
      <div style={{ padding: '1rem', background: 'rgba(244,63,94,0.1)', color: '#fecdd3', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'var(--font-code)' }}>
        <pre>{markup}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        overflowX: 'auto',
        padding: '1rem',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '10px',
        border: '1px solid var(--border-card)',
        display: 'flex',
        justifyContent: 'center',
      }}
    />
  );
};
