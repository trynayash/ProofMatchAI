import { useState, useEffect } from 'react';
import { getStats, getHistory } from '@/lib/api';
import StatsCards from '@/components/StatsCards';
import VerificationTable from '@/components/VerificationTable';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const COLORS = {
  GENUINE: '#16A34A',
  SUSPICIOUS: '#D97706',
  FAKE: '#DC2626',
};

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([getStats(), getHistory()]);
        setStats(statsRes.data);
        setRecords(historyRes.data || []);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
      </div>
    );
  }

  const pieData = stats
    ? [
        { name: 'Genuine', value: stats.genuine_count || 0 },
        { name: 'Suspicious', value: stats.suspicious_count || 0 },
        { name: 'Fake', value: stats.fake_count || 0 },
      ].filter((d) => d.value > 0)
    : [];

  // Group by date for bar chart
  const dateMap = {};
  records.forEach((r) => {
    const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Unknown';
    if (!dateMap[date]) dateMap[date] = { date, count: 0 };
    dateMap[date].count++;
  });
  const barData = Object.values(dateMap).slice(-14);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Aggregate verification statistics</p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Verdict Distribution */}
        <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Verdict Distribution
          </p>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name.toUpperCase()] || '#A1A1AA'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[entry.name.toUpperCase()] }}
                    />
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="py-8 text-center text-xs text-[var(--color-text-muted)]">No data yet</p>
          )}
        </div>

        {/* Verifications Over Time */}
        <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Verifications Over Time
          </p>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
                <Bar dataKey="count" fill="var(--color-accent)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-xs text-[var(--color-text-muted)]">No data yet</p>
          )}
        </div>
      </div>

      {/* Recent Verifications */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Recent Verifications
        </p>
        <VerificationTable records={records.slice(0, 10)} />
      </div>
    </div>
  );
}
