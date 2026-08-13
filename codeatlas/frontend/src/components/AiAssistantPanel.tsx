import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Key, Sparkles, Zap, Shield, TestTube, Copy, Check, RefreshCw, AlertCircle, HelpCircle, ExternalLink } from 'lucide-react';
import { apiService } from '../services/apiService';

interface AiAssistantPanelProps {
  repoId: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiAssistantPanel: React.FC<AiAssistantPanelProps> = ({ repoId }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('codeatlas_gemini_key') || '';
    setApiKey(savedKey);

    // Initial greeting
    setMessages([
      {
        id: 'msg_welcome',
        sender: 'ai',
        text: `👋 **Hello! I'm CodeAtlas AI Assistant** powered by **Google Gemini 2.0 Flash**.\n\nI have indexed the full AST structure, REST APIs, database schemas, and execution flows for this repository. Ask me anything about system architecture, blast-radius risks, refactoring recommendations, or code generation!`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, [repoId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem('codeatlas_gemini_key', newKey.trim());
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setPrompt('');
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await apiService.sendAiChat(repoId, textToSend, apiKey || undefined);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: res.answer,
        timestamp: new Date(res.timestamp).toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setErrorMsg(err.message || 'AI Assistant service encountered an error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', minWidth: 0 }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))', minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.66rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '0.55rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)' }}>
              <Bot size={24} color="white" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>CodeAtlas AI Assistant</h2>
            <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
              Google Gemini 2.0 Flash (Free Tier)
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Ask natural language questions about your repository structure, REST endpoints, database schemas, and blast radius impact.
          </p>
        </div>

        {/* Key Settings Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
          >
            <Key size={15} color={apiKey ? 'var(--accent-emerald)' : 'var(--accent-amber)'} />
            <span>{apiKey ? 'API Key Saved' : 'Configure Free Gemini Key'}</span>
          </button>
        </div>
      </div>

      {/* Free API Key Settings Drawer */}
      {showKeyInput && (
        <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--accent-indigo)' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Key size={16} color="var(--accent-indigo)" />
            Configure Your Personal Free Gemini API Key (100% Free)
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem', lineHeight: '1.45' }}>
            Google provides a 100% free Gemini API key (15 requests/min, 1,500 requests/day). Get your key in 15 seconds:
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => handleSaveApiKey(e.target.value)}
              placeholder="Paste your free Gemini API Key (AIzaSy...)"
              style={{ flex: 1, minWidth: '240px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-card)', color: '#38bdf8', padding: '0.55rem 0.85rem', borderRadius: '8px', fontFamily: 'var(--font-code)', fontSize: '0.85rem', outline: 'none' }}
            />
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-indigo)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '0.55rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              Get Free Key <ExternalLink size={13} />
            </a>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            * Your API Key is stored safely in your browser's local storage and is never saved on external databases.
          </div>
        </div>
      )}

      {/* Quick One-Click Prompt Chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', marginRight: '0.25rem' }}>Quick Prompts:</span>
        {[
          { label: '🔍 Explain System Architecture', prompt: 'Explain the overall system architecture, component breakdown, and design patterns used in this repository.' },
          { label: '💥 Blast Radius Analysis', prompt: 'Analyze the blast radius and downstream risks if I modify the main controller or database models.' },
          { label: '🧪 Generate Unit Tests', prompt: 'Generate comprehensive xUnit / Jest unit tests for the core REST endpoints and application services.' },
          { label: '🔒 Security & Refactoring', prompt: 'Audit this repository for security risks, performance bottlenecks, and suggest clean architecture refactoring.' },
        ].map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSend(chip.prompt)}
            disabled={isLoading}
            style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-card)', color: 'var(--text-main)', padding: '0.35rem 0.75rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '600', transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Main Chat Output Glass Panel */}
      <div className="glass-panel" style={{ padding: '0', background: '#0b0f17', borderRadius: '12px', border: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column', minHeight: '480px', minWidth: 0 }}>
        {/* Chat Log Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', maxHeight: '560px', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', maxWidth: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>{isUser ? 'You' : 'CodeAtlas AI'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div style={{
                  background: isUser ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(22, 27, 38, 0.85)',
                  color: isUser ? 'white' : 'var(--text-main)',
                  border: isUser ? 'none' : '1px solid var(--border-card)',
                  padding: '0.9rem 1.15rem',
                  borderRadius: isUser ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  maxWidth: '88%',
                  lineHeight: '1.6',
                  fontSize: '0.88rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  boxShadow: isUser ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none',
                }}>
                  {msg.text}

                  {!isUser && (
                    <div style={{ marginTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.4rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.73rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        {copiedId === msg.id ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontStyle: 'italic', padding: '0.5rem 0' }}>
              <RefreshCw size={16} className="spin" />
              <span>Gemini 2.0 Flash analyzing codebase AST context & generating answer...</span>
            </div>
          )}

          {errorMsg && (
            <div style={{ background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fecdd3', padding: '0.85rem 1.1rem', borderRadius: '10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertCircle size={18} color="var(--accent-rose)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>{errorMsg}</div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-card)', background: '#111827', borderRadius: '0 0 12px 12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask CodeAtlas AI about this codebase (e.g. How does order processing work?)..."
            style={{ flex: 1, background: 'rgba(0, 0, 0, 0.4)', border: '1px solid var(--border-card)', color: 'white', padding: '0.7rem 1rem', borderRadius: '10px', fontSize: '0.88rem', outline: 'none' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !prompt.trim()}
            className="btn-primary"
            style={{ padding: '0.7rem 1.3rem', fontSize: '0.88rem', opacity: isLoading || !prompt.trim() ? 0.6 : 1 }}
          >
            <Send size={16} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
