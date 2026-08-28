import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, Laptop, RefreshCw, Sparkles, Code2, Eye, Check, Layers, Play } from 'lucide-react';
import { apiService } from '../services/apiService';

interface UiPreviewSandboxPanelProps {
  repoId: string;
}

export const UiPreviewSandboxPanel: React.FC<UiPreviewSandboxPanelProps> = ({ repoId }) => {
  const [data, setData] = useState<any>(null);
  const [selectedCompId, setSelectedCompId] = useState<string>('');
  const [mockJson, setMockJson] = useState<string>('{}');
  const [parsedMockData, setParsedMockData] = useState<any>({});
  const [viewportWidth, setViewportWidth] = useState<string>('100%');
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview');

  useEffect(() => {
    fetchPreviewData();
  }, [repoId]);

  const fetchPreviewData = async () => {
    setIsLoading(true);
    try {
      const res = await apiService.getUiPreviewComponents(repoId);
      setData(res);
      if (res.discoveredComponents && res.discoveredComponents.length > 0) {
        const initialComp = res.discoveredComponents[0];
        setSelectedCompId(initialComp.id);
        setMockJson(initialComp.mockDataJson || '{}');
        parseJson(initialComp.mockDataJson || '{}');
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const parseJson = (str: string) => {
    try {
      const obj = JSON.parse(str);
      setParsedMockData(obj);
    } catch {
      // Invalid JSON
    }
  };

  const handleSelectComponent = (comp: any) => {
    setSelectedCompId(comp.id);
    setMockJson(comp.mockDataJson || '{}');
    parseJson(comp.mockDataJson || '{}');
  };

  const handleJsonChange = (str: string) => {
    setMockJson(str);
    parseJson(str);
  };

  const handleRegenerateData = async () => {
    const activeComp = data?.discoveredComponents?.find((c: any) => c.id === selectedCompId);
    const compName = activeComp?.name || 'OrderManagementDashboard';

    setIsRegenerating(true);
    try {
      const res = await apiService.generateMockDataOnTheFly(repoId, compName);
      setMockJson(res.mockDataJson);
      parseJson(res.mockDataJson);
    } catch {
      // Fallback
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-cyan)' }} />
        <div>Discovering UI Component Blueprints & Synthesizing On-the-Fly Mock Data...</div>
      </div>
    );
  }

  const activeComp = data?.discoveredComponents?.find((c: any) => c.id === selectedCompId) || data?.discoveredComponents?.[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(30, 27, 75, 0.6))', border: '1.5px solid var(--accent-indigo)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #38bdf8)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
              <Eye size={24} color="white" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>Live UI Preview & Synthetic Data Sandbox</h2>
                <span style={{ background: 'rgba(56, 189, 248, 0.18)', color: 'var(--accent-cyan)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                  On-the-Fly Mocking Active
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Preview UI components for your repository rendered live with context-aware, synthetic dummy data generated on the fly.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button onClick={handleRegenerateData} disabled={isRegenerating} className="btn-primary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}>
              {isRegenerating ? <RefreshCw size={15} className="spin" /> : <Sparkles size={15} />}
              <span>Regenerate Mock Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar: Component Selector + Viewport Controls + View Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem', background: 'rgba(0,0,0,0.4)', padding: '0.65rem 1rem', borderRadius: '10px', border: '1px solid var(--border-card)' }}>
        {/* Discovered Component Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700' }}>Discovered UI View:</span>
          <select
            value={selectedCompId}
            onChange={(e) => {
              const found = data?.discoveredComponents?.find((c: any) => c.id === e.target.value);
              if (found) handleSelectComponent(found);
            }}
            style={{ background: 'rgba(15,23,42,0.9)', color: 'white', border: '1px solid var(--border-card)', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '700', outline: 'none' }}
          >
            {data?.discoveredComponents?.map((comp: any) => (
              <option key={comp.id} value={comp.id}>
                {comp.name} ({comp.type})
              </option>
            ))}
          </select>
        </div>

        {/* Viewport Width Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '8px' }}>
          <button onClick={() => setViewportWidth('100%')} style={{ background: viewportWidth === '100%' ? 'var(--accent-indigo)' : 'transparent', color: viewportWidth === '100%' ? 'white' : 'var(--text-muted)', border: 'none', padding: '0.3rem 0.55rem', borderRadius: '6px', cursor: 'pointer' }} title="Desktop Viewport (100%)">
            <Monitor size={15} />
          </button>
          <button onClick={() => setViewportWidth('1024px')} style={{ background: viewportWidth === '1024px' ? 'var(--accent-indigo)' : 'transparent', color: viewportWidth === '1024px' ? 'white' : 'var(--text-muted)', border: 'none', padding: '0.3rem 0.55rem', borderRadius: '6px', cursor: 'pointer' }} title="Laptop Viewport (1024px)">
            <Laptop size={15} />
          </button>
          <button onClick={() => setViewportWidth('768px')} style={{ background: viewportWidth === '768px' ? 'var(--accent-indigo)' : 'transparent', color: viewportWidth === '768px' ? 'white' : 'var(--text-muted)', border: 'none', padding: '0.3rem 0.55rem', borderRadius: '6px', cursor: 'pointer' }} title="Tablet Viewport (768px)">
            <Tablet size={15} />
          </button>
          <button onClick={() => setViewportWidth('375px')} style={{ background: viewportWidth === '375px' ? 'var(--accent-indigo)' : 'transparent', color: viewportWidth === '375px' ? 'white' : 'var(--text-muted)', border: 'none', padding: '0.3rem 0.55rem', borderRadius: '6px', cursor: 'pointer' }} title="Mobile Viewport (375px)">
            <Smartphone size={15} />
          </button>
        </div>

        {/* Canvas Mode Switcher: Live Preview vs JSON Mock Data */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={() => setActiveTab('preview')} style={{ background: activeTab === 'preview' ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.06)', color: activeTab === 'preview' ? 'white' : 'var(--text-muted)', border: '1px solid var(--border-card)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
            <Eye size={14} style={{ display: 'inline', marginRight: '0.3rem' }} /> Live Render Canvas
          </button>
          <button onClick={() => setActiveTab('json')} style={{ background: activeTab === 'json' ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.06)', color: activeTab === 'json' ? 'white' : 'var(--text-muted)', border: '1px solid var(--border-card)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
            <Code2 size={14} style={{ display: 'inline', marginRight: '0.3rem' }} /> Mock Data JSON Editor
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Container */}
      <div style={{ display: 'flex', justifyContent: 'center', transition: 'all 0.3s ease' }}>
        <div className="glass-panel" style={{ width: viewportWidth, minHeight: '480px', padding: '1.5rem', border: '1px solid var(--border-card)', borderRadius: '12px', background: 'rgba(10, 14, 23, 0.95)', transition: 'width 0.3s ease' }}>
          {activeTab === 'preview' ? (
            /* Render Dynamic Live UI Component Preview */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-card)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', margin: 0 }}>{activeComp?.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)', marginTop: '0.15rem' }}>📄 {activeComp?.filePath}</div>
                </div>
                <span style={{ background: 'rgba(74, 222, 128, 0.15)', color: 'var(--accent-emerald)', padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800' }}>
                  Live Data Bound
                </span>
              </div>

              {/* Dynamic UI View Content Based on Discovered Blueprint & Synthetic JSON Data */}
              {activeComp?.name?.includes('Payment') ? (
                /* Payment Checkout Gateway Mock View */
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '440px', margin: '0 auto' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'white' }}>💳 Checkout Payment Gateway</div>
                  <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', padding: '1rem', borderRadius: '10px', color: 'white' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CARD NUMBER</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', letterSpacing: '0.1em', marginTop: '0.2rem' }}>•••• •••• •••• {parsedMockData.paymentMethod?.last4 || '4242'}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginTop: '0.8rem' }}>
                      <span>HOLDER: {parsedMockData.customer?.name || 'Shatrughna Ambhore'}</span>
                      <span>EXP: {parsedMockData.paymentMethod?.expiry || '12/28'}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '800', borderTop: '1px solid var(--border-card)', paddingTop: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Charge:</span>
                    <span style={{ color: 'var(--accent-emerald)' }}>${parsedMockData.amount || '149.99'} {parsedMockData.currency || 'USD'}</span>
                  </div>

                  <button className="btn-primary" style={{ padding: '0.65rem', fontSize: '0.88rem', justifyContent: 'center' }}>
                    Confirm & Pay ${parsedMockData.amount || '149.99'}
                  </button>
                </div>
              ) : activeComp?.name?.includes('User') ? (
                /* User Security & Profile Card View */
                <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '480px', margin: '0 auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ background: 'var(--accent-indigo)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '900', color: 'white' }}>
                      {parsedMockData.fullName ? parsedMockData.fullName.charAt(0) : 'S'}
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: '800', color: 'white' }}>{parsedMockData.fullName || 'Shatrughna Ambhore'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{parsedMockData.email || 'ambhoreshatrughna@gmail.com'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Role:</span> <strong style={{ color: 'white' }}>{parsedMockData.role || 'Senior Architect'}</strong>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>2FA Security:</span> <strong style={{ color: 'var(--accent-emerald)' }}>Enabled</strong>
                    </div>
                  </div>
                </div>
              ) : (
                /* Default Dashboard / Order Management View */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Summary Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                    <div style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid var(--accent-indigo)', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL ORDERS</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', marginTop: '0.15rem' }}>{parsedMockData.summary?.totalOrders || 482}</div>
                    </div>
                    <div style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid var(--accent-emerald)', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL REVENUE</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--accent-emerald)', marginTop: '0.15rem' }}>${(parsedMockData.summary?.totalRevenue || 94200).toLocaleString()}</div>
                    </div>
                    <div style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid var(--accent-cyan)', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>ACTIVE USERS</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', marginTop: '0.15rem' }}>{parsedMockData.summary?.activeUsers || 2480}</div>
                    </div>
                  </div>

                  {/* Synthetic Data Items Table */}
                  {parsedMockData.items && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'white', marginBottom: '0.75rem' }}>Real-Time Synthetic Records Table</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {parsedMockData.items?.map((row: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '0.55rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <span style={{ fontWeight: '800', color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)' }}>{row.id}</span>
                              <span style={{ color: 'white', fontWeight: '600' }}>{row.customer}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                              <span style={{ background: 'rgba(74,222,128,0.15)', color: 'var(--accent-emerald)', padding: '0.1rem 0.45rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800' }}>
                                {row.status}
                              </span>
                              <span style={{ color: 'white', fontWeight: '700' }}>${row.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Live Editable JSON Mock Data Editor */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                Edit Synthetic Mock JSON (UI Canvas updates live in real-time):
              </div>
              <textarea
                rows={16}
                value={mockJson}
                onChange={(e) => handleJsonChange(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid var(--border-card)', padding: '1rem', borderRadius: '10px', color: '#38bdf8', fontSize: '0.85rem', fontFamily: 'var(--font-code)', outline: 'none', resize: 'vertical', width: '100%' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
