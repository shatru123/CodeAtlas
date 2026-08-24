import React, { useState, useEffect } from 'react';
import { X, Lock, Key, Users, Globe, Eye, Download, RefreshCw, MapPin, Smartphone, Monitor, ShieldCheck, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

interface AdminAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAnalyticsModal: React.FC<AdminAnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Reset state on modal open
    if (isOpen) {
      const savedPin = localStorage.getItem('codeatlas_admin_pin') || '';
      if (savedPin) {
        setPin(savedPin);
        fetchDashboard(savedPin);
      }
    } else {
      setErrorMsg(null);
    }
  }, [isOpen]);

  const fetchDashboard = async (pinToUse: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.getAdminDashboard(pinToUse);
      setDashboardData(data);
      setIsAuthenticated(true);
      localStorage.setItem('codeatlas_admin_pin', pinToUse);
    } catch (err: any) {
      setIsAuthenticated(false);
      setErrorMsg(err.message || 'Invalid Secret PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboard(pin);
  };

  const handleExportCsv = () => {
    if (!dashboardData?.logs) return;
    const headers = ['Timestamp', 'IP Address', 'Country', 'City', 'Device', 'ISP', 'Referrer', 'Email', 'Visit Count'];
    const rows = dashboardData.logs.map((l: any) => [
      new Date(l.timestamp).toLocaleString(),
      l.ipAddress,
      l.country,
      l.city,
      l.deviceType,
      `"${l.isp}"`,
      `"${l.referrer || ''}"`,
      `"${l.email || ''}"`,
      l.visitCount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `codeatlas_visitor_logs_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0, 0, 0, 0.82)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '1050px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#0d111a', border: '1.5px solid var(--accent-indigo)', borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ background: '#111827', padding: '1.1rem 1.5rem', borderBottom: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '0.45rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>Admin Visitor & Analytics Dashboard</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Private Visitor Geolocation & Traffic Metrics (Shatrughna Ambhore Only)</p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: 'var(--text-muted)', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {!isAuthenticated ? (
            /* PIN Security Screen */
            <div style={{ maxWidth: '420px', margin: '3rem auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.15)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                <Lock size={28} color="var(--accent-indigo)" />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'white' }}>Enter Admin Secret PIN</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                This analytics dashboard is restricted to Shatrughna. Enter your admin PIN to view live visitor IPs, locations, and traffic logs.
              </p>

              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter Secret Admin PIN"
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-card)', color: '#38bdf8', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.95rem', textAlign: 'center', outline: 'none', fontFamily: 'var(--font-code)' }}
                  autoFocus
                />

                {errorMsg && (
                  <div style={{ color: 'var(--accent-rose)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <AlertCircle size={15} /> {errorMsg}
                  </div>
                )}

                <button type="submit" className="btn-primary" disabled={isLoading} style={{ justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem' }}>
                  {isLoading ? <RefreshCw size={16} className="spin" /> : <Key size={16} />}
                  <span>Unlock Admin Dashboard</span>
                </button>
              </form>
            </div>
          ) : (
            /* Dashboard View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="pulsing-dot" /> Live Visitor Tracking Active
                </div>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button onClick={() => fetchDashboard(pin)} className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
                    <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Refresh Stats
                  </button>

                  <button onClick={handleExportCsv} className="btn-primary" style={{ padding: '0.45rem 0.95rem', fontSize: '0.8rem' }}>
                    <Download size={14} /> Export CSV
                  </button>
                </div>
              </div>

              {/* 3 Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Total Pageviews</span>
                    <Eye size={18} color="var(--accent-cyan)" />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white' }}>{dashboardData?.totalPageviews || 0}</div>
                </div>

                <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Unique Visitors</span>
                    <Users size={18} color="var(--accent-indigo)" />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white' }}>{dashboardData?.uniqueVisitors || 0}</div>
                </div>

                <div className="glass-panel" style={{ padding: '1.1rem 1.25rem', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Countries Reached</span>
                    <Globe size={18} color="var(--accent-purple)" />
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: '900', color: 'white' }}>{dashboardData?.countriesCount || 0}</div>
                </div>
              </div>

              {/* Geolocation Country Breakdown Table */}
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Globe size={18} color="var(--accent-cyan)" /> Visitor Geolocation Breakdown
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {dashboardData?.countryBreakdown?.map((c: any, i: number) => (
                    <div key={i} style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border-card)', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>🌐</span>
                        <div>
                          <div style={{ fontWeight: '700', color: 'white', fontSize: '0.88rem' }}>{c.country}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.countryCode}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '800', color: 'var(--accent-indigo)', fontSize: '0.95rem' }}>{c.uniqueVisitors} Unique</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.totalPageviews} Views</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Visitor Activity Log */}
              <div className="glass-panel" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <MapPin size={18} color="var(--accent-emerald)" /> Live Visitor Activity Log ({dashboardData?.logs?.length || 0})
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-card)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Timestamp</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>IP Address</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Location</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Device</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>ISP / Provider</th>
                        <th style={{ padding: '0.6rem 0.8rem' }}>Visits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData?.logs?.map((log: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', fontWeight: '700', color: 'var(--accent-cyan)', fontFamily: 'var(--font-code)' }}>
                            {log.ipAddress}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', color: 'white', fontWeight: '600' }}>
                            <div>📍 {log.exactLocation && log.exactLocation !== 'Unknown' ? log.exactLocation : `${log.city}, ${log.country}`}</div>
                            {log.latitude && log.longitude && (
                              <a
                                href={`https://maps.google.com/?q=${log.latitude},${log.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textDecoration: 'underline', marginTop: '0.15rem', display: 'inline-block' }}
                              >
                                🗺️ View Exact GPS Map Pin ({log.latitude.toFixed(4)}, {log.longitude.toFixed(4)})
                              </a>
                            )}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-main)' }}>
                            {log.deviceType === 'Mobile' ? <Smartphone size={14} color="var(--accent-amber)" style={{ display: 'inline', marginRight: '0.3rem' }} /> : <Monitor size={14} color="var(--accent-indigo)" style={{ display: 'inline', marginRight: '0.3rem' }} />}
                            {log.deviceType}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.isp}
                          </td>
                          <td style={{ padding: '0.6rem 0.8rem' }}>
                            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800', fontSize: '0.72rem' }}>
                              {log.visitCount}x
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
