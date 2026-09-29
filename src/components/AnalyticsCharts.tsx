import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import type { Click, Link } from '@/lib/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const isDark = () => document.documentElement.classList.contains('dark');

function chartColors() {
  const dark = isDark();
  return {
    text: dark ? '#94a3b8' : '#64748b',
    grid: dark ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.15)',
  };
}

interface AnalyticsChartsProps {
  clicks: Click[];
  links: Link[];
}

export function AnalyticsCharts({ clicks, links }: AnalyticsChartsProps) {
  const colors = chartColors();

  // Click timeline (last 14 days)
  const timelineData = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = 0;
    }
    clicks.forEach((c) => {
      const key = c.created_at.slice(0, 10);
      if (key in days) days[key]++;
    });
    const labels = Object.keys(days).map((k) => {
      const d = new Date(k);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    return {
      labels,
      datasets: [
        {
          label: 'Clicks',
          data: Object.values(days),
          borderColor: '#3366ff',
          backgroundColor: 'rgba(51,102,255,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#3366ff',
        },
      ],
    };
  }, [clicks]);

  // Device breakdown
  const deviceData = useMemo(() => {
    const counts: Record<string, number> = {};
    clicks.forEach((c) => {
      const d = c.device || 'Unknown';
      counts[d] = (counts[d] || 0) + 1;
    });
    const labels = Object.keys(counts);
    return {
      labels,
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: ['#3366ff', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b'],
          borderWidth: 0,
        },
      ],
    };
  }, [clicks]);

  // Browser usage
  const browserData = useMemo(() => {
    const counts: Record<string, number> = {};
    clicks.forEach((c) => {
      const b = c.browser || 'Other';
      counts[b] = (counts[b] || 0) + 1;
    });
    return {
      labels: Object.keys(counts),
      datasets: [
        {
          label: 'Clicks',
          data: Object.values(counts),
          backgroundColor: '#3366ff',
          borderRadius: 8,
        },
      ],
    };
  }, [clicks]);

  // OS distribution
  const osData = useMemo(() => {
    const counts: Record<string, number> = {};
    clicks.forEach((c) => {
      const o = c.os || 'Other';
      counts[o] = (counts[o] || 0) + 1;
    });
    return {
      labels: Object.keys(counts),
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: ['#3366ff', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'],
          borderWidth: 0,
        },
      ],
    };
  }, [clicks]);

  // Top links
  const topLinks = useMemo(() => {
    return [...links].sort((a, b) => b.clicks_count - a.clicks_count).slice(0, 5);
  }, [links]);

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: colors.text, font: { size: 12 } },
      },
    },
    scales: {
      x: { ticks: { color: colors.text }, grid: { color: colors.grid } },
      y: { ticks: { color: colors.text }, grid: { color: colors.grid }, beginAtZero: true },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: colors.text, font: { size: 12 }, padding: 12 },
      },
    },
  };

  if (clicks.length === 0 && links.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-slate-400">No analytics data yet. Create some links and share them to see data here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Click Timeline */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4">Click Timeline (14 days)</h3>
        <div style={{ height: '280px' }}>
          <Line data={timelineData} options={baseOptions} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Device Breakdown</h3>
          <div style={{ height: '260px' }}>
            <Doughnut data={deviceData} options={doughnutOptions} />
          </div>
        </div>

        {/* OS Distribution */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Operating System</h3>
          <div style={{ height: '260px' }}>
            <Doughnut data={osData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Browser Usage */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold mb-4">Browser Usage</h3>
        <div style={{ height: '240px' }}>
          <Bar data={browserData} options={baseOptions} />
        </div>
      </div>

      {/* Top Performing Links */}
      {topLinks.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">Top Performing Links</h3>
          <div className="space-y-3">
            {topLinks.map((link, i) => (
              <div key={link.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{link.title || link.original_url}</p>
                  <p className="text-xs text-slate-400 font-mono">/r/{link.short_code}</p>
                </div>
                <span className="text-sm font-bold">{link.clicks_count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
