import React, { useState } from 'react';
import { FolderGit2, Search, FileCode, Code, Layers, FileText } from 'lucide-react';
import axios from 'axios';

interface CodeSymbol {
  name: string;
  kind: string;
  filePath: string;
  lineNumber: number;
  signature: string;
}

export const CodeExplorer: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('https://github.com/shatru123/CodeAtlas');
  const [searchQuery, setSearchQuery] = useState('');
  const [symbols, setSymbols] = useState<CodeSymbol[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');

  const handleInspectRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setIsLoading(true);
    try {
      // Clone/fetch symbols for inspection
      const cloneRes = await axios.post('http://localhost:5000/api/workspace/clone', { repoUrl });
      const taskId = cloneRes.data.taskId;

      const symbolsRes = await axios.get<CodeSymbol[]>(`http://localhost:5000/api/workspace/${taskId}/symbols?query=${encodeURIComponent(searchQuery)}`);
      setSymbols(symbolsRes.data);
    } catch (err: any) {
      console.error('Failed to inspect repository:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="explorer-container">
      <div className="explorer-sidebar">
        <form onSubmit={handleInspectRepo} className="explorer-search-card">
          <h3 className="card-title">
            <FolderGit2 size={16} /> Repository Visualizer & Map
          </h3>
          <div className="form-group">
            <input
              type="url"
              className="form-input"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/user/repository"
              required
            />
          </div>
          <div className="form-group">
            <div className="search-input-wrapper">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                className="form-input search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search classes, interfaces, methods..."
              />
            </div>
          </div>
          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'Indexing Repo...' : 'Inspect & Index Codebase'}
          </button>
        </form>

        <div className="symbol-list-card">
          <h4>Indexed Symbols ({symbols.length})</h4>
          {symbols.length === 0 ? (
            <p className="text-muted">Enter a repository URL above to generate an AST symbol map of classes, methods, and interfaces.</p>
          ) : (
            <div className="symbol-scroll">
              {symbols.map((sym, index) => (
                <div key={index} className="symbol-item" onClick={() => { setActiveFile(sym.filePath); setFileContent(`// ${sym.kind}: ${sym.signature}\n// File: ${sym.filePath}:${sym.lineNumber}`); }}>
                  <div className="symbol-icon">
                    {sym.kind === 'Class' && <Layers size={14} className="icon-class" />}
                    {sym.kind === 'Interface' && <Code size={14} className="icon-interface" />}
                    {sym.kind === 'Method' && <FileCode size={14} className="icon-method" />}
                  </div>
                  <div className="symbol-info">
                    <div className="symbol-name">{sym.name}</div>
                    <div className="symbol-path">{sym.filePath}:{sym.lineNumber}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="explorer-main">
        <div className="code-preview-card">
          <div className="code-preview-header">
            <FileText size={16} />
            <span>{activeFile || 'Select a symbol to view source code preview'}</span>
          </div>
          <pre className="code-preview-body">
            <code>{fileContent || '// Roslyn AST Code Visualizer ready.'}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
