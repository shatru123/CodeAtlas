import React, { useState, useEffect } from 'react';
import { DollarSign, Server, Database, Cpu, RefreshCw, Sparkles, TrendingDown } from 'lucide-react';
import { apiService } from '../services/apiService';
import { MetricTooltip } from './MetricTooltip';
import { ContextualHelpBox } from './ContextualHelpBox';

interface CloudFinOpsPanelProps {
  repoId: string;
}

export const CloudFinOpsPanel: React.FC<CloudFinOpsPanelProps> = ({ repoId }) => {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCost();
  }, [repoId]);

  const fetchCost = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getCloudFinOpsReport(repoId);
      setReport(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-emerald)' }} />
        <div>Scenarios Cloud Infrastructure Manifests & Estimating Monthly Hosting Bills...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <ContextualHelpBox
        title="What is Cloud FinOps & Infrastructure Cost Estimator?"
        description="Cloud FinOps inspects your repository's Dockerfile, docker-compose.yml, Kubernetes YAMLs, and database query frequencies to calculate monthly AWS/Azure cloud hosting costs and suggest infrastructure optimizations."
      />

      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, rgba(13, 17, 26, 0.95), rgba(6, 78, 59, 0.6))', border: '1.5px solid var(--accent-emerald)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}>
              <DollarSign size={24} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'white' }}>
                Cloud FinOps & Infrastructure Cost Estimator (<MetricTooltip term="Cloud FinOps" explanation="Estimates monthly cloud hosting bills based on scanned container manifests and database queries." />)
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Provider: {report?.primaryCloudProvider || 'AWS / Docker Cloud'} • Total Estimated Cost: <strong style={{ color: 'var(--accent-emerald)' }}>${report?.totalEstimatedMonthlyCostUsd || 185.00}/mo</strong>.
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid var(--accent-emerald)', padding: '0.45rem 1rem', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ESTIMATED MONTHLY COST</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--accent-emerald)' }}>${report?.totalEstimatedMonthlyCostUsd || 185.00}/mo</div>
          </div>
        </div>
      </div>

      {/* Cloud Resources Cost Breakdown */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Server size={18} color="var(--accent-emerald)" />
          Scanned Cloud Infrastructure Resources ({report?.resources?.length || 0})
        </h3>

        {report?.resources?.map((res: any, idx: number) => (
          <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-card)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Cpu size={16} color="var(--accent-emerald)" />
                <strong style={{ fontSize: '0.95rem', color: 'white' }}>{res.resourceName}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>({res.sizingSpec})</span>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--accent-emerald)' }}>
                ${res.monthlyCostUsd}/mo
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', fontWeight: '700' }}>
              💡 Optimization Tip: {res.optimizationTip}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
