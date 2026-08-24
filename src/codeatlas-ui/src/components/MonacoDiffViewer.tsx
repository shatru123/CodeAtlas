import React, { useState } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { FileCode, GitCompare } from 'lucide-react';
import type { CodeDiffModel } from '../types';

interface MonacoDiffViewerProps {
  diffs: CodeDiffModel[];
}

export const MonacoDiffViewer: React.FC<MonacoDiffViewerProps> = ({ diffs }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!diffs || diffs.length === 0) {
    return (
      <div className="diff-card empty">
        <GitCompare size={32} className="text-muted" />
        <p>No modified files yet. The Coder Agent will display side-by-side code diffs here once changes are generated.</p>
      </div>
    );
  }

  const selectedDiff = diffs[selectedIndex] || diffs[0];

  return (
    <div className="diff-card">
      <div className="diff-header">
        <div className="diff-title">
          <GitCompare size={18} />
          <span>Code Modifications ({diffs.length} file{diffs.length > 1 ? 's' : ''})</span>
        </div>
        <div className="diff-tabs">
          {diffs.map((diff, index) => (
            <button
              key={diff.filePath}
              className={`diff-tab ${index === selectedIndex ? 'active' : ''}`}
              onClick={() => setSelectedIndex(index)}
            >
              <FileCode size={14} />
              <span>{diff.filePath}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="diff-editor-container">
        <DiffEditor
          height="450px"
          language="csharp"
          theme="vs-dark"
          original={selectedDiff.originalContent}
          modified={selectedDiff.modifiedContent}
          options={{
            readOnly: true,
            renderSideBySide: true,
            minimap: { enabled: false },
            fontSize: 13,
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
};
