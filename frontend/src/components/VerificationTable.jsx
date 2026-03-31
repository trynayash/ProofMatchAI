import { CheckCircle2, AlertTriangle, XCircle, Eye } from '@/components/icons';

const verdictBadge = {
  GENUINE: { icon: CheckCircle2, color: 'var(--color-success)', bg: 'var(--color-success-bg)', label: 'Genuine' },
  SUSPICIOUS: { icon: AlertTriangle, color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', label: 'Suspicious' },
  FAKE: { icon: XCircle, color: 'var(--color-danger)', bg: 'var(--color-danger-bg)', label: 'Fake' },
};

export default function VerificationTable({ records, onViewDetail }) {
  if (!records || records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-6 py-16">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-bg-elevated)]">
          <Eye className="h-5 w-5 text-[var(--color-text-muted)]" />
        </div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">No verifications yet</p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">Upload a UPI screenshot to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Date</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">TXN ID</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Amount</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Verdict</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Confidence</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => {
              const fields = record.extracted_fields || {};
              const v = verdictBadge[record.verdict] || verdictBadge.SUSPICIOUS;
              const BadgeIcon = v.icon;
              const date = record.created_at
                ? new Date(record.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—';

              return (
                <tr
                  key={record.id || index}
                  className="border-b border-[var(--color-border)] last:border-b-0 transition-colors hover:bg-[var(--color-bg)]"
                >
                  <td className="px-4 py-3 text-xs text-[var(--color-text-secondary)]">{date}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-[var(--color-text-primary)]">
                      {record.txn_id ? record.txn_id.slice(0, 16) : '—'}
                      {record.txn_id && record.txn_id.length > 16 ? '…' : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-[var(--color-text-primary)]">
                    {fields.amount || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: v.bg, color: v.color }}
                    >
                      <BadgeIcon className="h-3 w-3" />
                      {v.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-12 overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${record.confidence_score || 0}%`, backgroundColor: v.color }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-[var(--color-text-secondary)]">
                        {Math.round(record.confidence_score || 0)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onViewDetail?.(record)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] bg-transparent border-none cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
