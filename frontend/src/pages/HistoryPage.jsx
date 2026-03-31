import { useState } from 'react';
import { useHistory } from '@/hooks/useHistory';
import VerificationTable from '@/components/VerificationTable';
import ResultCard from '@/components/ResultCard';
import { X, Filter } from '@/components/icons';

export default function HistoryPage() {
  const { records, loading, error, filters, setFilters, refetch } = useHistory();
  const [selectedRecord, setSelectedRecord] = useState(null);

  const verdictOptions = ['all', 'GENUINE', 'SUSPICIOUS', 'FAKE'];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Verification History</h1>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            {records.length} verification{records.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          <select
            value={filters.verdict}
            onChange={(e) => setFilters({ ...filters, verdict: e.target.value })}
            className="rounded-md border border-[var(--color-border)] bg-white px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] outline-none cursor-pointer"
          >
            {verdictOptions.map((v) => (
              <option key={v} value={v}>
                {v === 'all' ? 'All Verdicts' : v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-bg)] px-4 py-3">
          <p className="text-sm text-[var(--color-danger)]">{error}</p>
          <button
            onClick={refetch}
            className="mt-2 text-xs text-[var(--color-text-secondary)] underline bg-transparent border-none cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <VerificationTable records={records} onViewDetail={setSelectedRecord} />
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl bg-[var(--color-bg)] p-1 animate-scale-in">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md bg-white border border-[var(--color-border)] cursor-pointer transition-colors hover:bg-[var(--color-bg-elevated)]"
            >
              <X className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
            </button>
            <ResultCard
              result={{
                verdict_report: {
                  verdict: selectedRecord.verdict,
                  confidence_score: selectedRecord.confidence_score,
                  reasoning_summary: selectedRecord.reasoning_summary,
                  red_flags: selectedRecord.red_flags,
                  recommended_action: selectedRecord.recommended_action,
                },
                extracted_fields: selectedRecord.extracted_fields,
                document_id: selectedRecord.id,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
