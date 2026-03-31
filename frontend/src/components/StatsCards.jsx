import { Shield, AlertTriangle, XCircle, BarChart3 } from '@/components/icons';

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      label: 'Total Verified',
      value: stats.total_verifications || 0,
      icon: BarChart3,
      color: 'var(--color-accent)',
    },
    {
      label: 'Genuine',
      value: `${stats.genuine_percentage || 0}%`,
      subtitle: `${stats.genuine_count || 0} transactions`,
      icon: Shield,
      color: 'var(--color-success)',
    },
    {
      label: 'Suspicious',
      value: `${stats.suspicious_percentage || 0}%`,
      subtitle: `${stats.suspicious_count || 0} transactions`,
      icon: AlertTriangle,
      color: 'var(--color-warning)',
    },
    {
      label: 'Fake',
      value: `${stats.fake_percentage || 0}%`,
      subtitle: `${stats.fake_count || 0} transactions`,
      icon: XCircle,
      color: 'var(--color-danger)',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ label, value, subtitle, icon: Icon, color }) => (
        <div
          key={label}
          className="animate-slide-up rounded-lg border border-[var(--color-border)] bg-white px-4 py-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">{label}</p>
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color }}>
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{subtitle}</p>
          )}
        </div>
      ))}
    </div>
  );
}
