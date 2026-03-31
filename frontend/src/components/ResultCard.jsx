import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Download, FileJson, ShieldAlert, Cpu } from '@/components/icons';
import { generatePdfReport } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const verdictConfig = {
  GENUINE: {
    icon: CheckCircle2,
    label: 'Genuine',
    color: 'var(--color-success)',
    bg: 'var(--color-success-bg)',
    borderColor: '#BBF7D0',
  },
  SUSPICIOUS: {
    icon: AlertTriangle,
    label: 'Suspicious',
    color: 'var(--color-warning)',
    bg: 'var(--color-warning-bg)',
    borderColor: '#FDE68A',
  },
  FAKE: {
    icon: XCircle,
    label: 'Fake',
    color: 'var(--color-danger)',
    bg: 'var(--color-danger-bg)',
    borderColor: '#FECACA',
  },
};

export default function ResultCard({ result }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [downloading, setDownloading] = useState(false);

  if (!result) return null;

  const report = result.verdict_report || {};
  const fields = result.extracted_fields || {};
  const metadata = result.metadata_analysis || {};
  const duplicate = result.duplicate_check || {};
  const verdict = report.verdict || 'SUSPICIOUS';
  const config = verdictConfig[verdict] || verdictConfig.SUSPICIOUS;
  const VerdictIcon = config.icon;
  const confidence = report.confidence_score || 0;

  const handleDownloadPdf = async () => {
    if (!result.document_id) return;
    setDownloading(true);
    toast.loading('Generating forensic report...', { id: 'pdf-toast' });
    try {
      const blob = await generatePdfReport(result.document_id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proofmatch_${result.document_id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report downloaded successfully', { id: 'pdf-toast' });
    } catch (err) {
      console.error('PDF download failed:', err);
      toast.error('Failed to generate report', { id: 'pdf-toast' });
    } finally {
      setDownloading(false);
    }
  };

  const fieldRows = [
    { label: 'Transaction ID', value: fields.txn_id },
    { label: 'Amount', value: fields.amount },
    { label: 'Sender', value: fields.sender_upi || fields.sender_name },
    { label: 'Receiver', value: fields.receiver_upi || fields.receiver_name },
    { label: 'Timestamp', value: fields.timestamp },
    { label: 'Payment App', value: fields.payment_app },
    { label: 'Status', value: fields.status },
    { label: 'Bank Ref', value: fields.bank_ref_no },
  ].filter((r) => r.value);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Cpu },
    { id: 'forensics', label: 'Forensics', icon: ShieldAlert },
    { id: 'raw', label: 'Raw Payload', icon: FileJson },
  ];

  return (
    <div className="animate-slide-up rounded-xl border border-[var(--color-border)] bg-white overflow-hidden shadow-sm">
      {/* Verdict Header */}
      <div
        className="flex items-center justify-between px-6 py-5"
        style={{ backgroundColor: config.bg, borderBottom: '1px solid ' + config.borderColor }}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <VerdictIcon className="h-6 w-6" style={{ color: config.color }} />
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight" style={{ color: config.color }}>
              {config.label} Payment
            </p>
            <p className="text-xs font-medium text-[var(--color-text-secondary)] opacity-80">
              Analysis Complete
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold tracking-tighter tabular-nums" style={{ color: config.color }}>
            {confidence}<span className="text-lg opacity-70">%</span>
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mt-1">
            Confidence
          </p>
        </div>
      </div>

      {/* Confidence Bar (Animated) */}
      <div className="h-1.5 w-full bg-[#f1f5f9]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-r-full"
          style={{ backgroundColor: config.color }}
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-6 border-b border-[var(--color-border)] px-6 pt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "group relative flex items-center gap-2 pb-3 pt-3 text-xs font-medium transition-colors border-none bg-transparent cursor-pointer",
                isActive ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5 transition-colors", isActive ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]")} />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-accent)] rounded-t-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="px-6 py-5">
        <AnimatePresence mode="wait">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {report.reasoning_summary && (
                <div className="mb-6 rounded-lg bg-[#f8fafc] p-4 border border-[#e2e8f0]">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Agent Reasoning</p>
                  <p className="text-sm leading-relaxed text-[var(--color-text-primary)]">{report.reasoning_summary}</p>
                  {report.recommended_action && (
                    <div className="mt-4 flex items-start gap-2">
                      <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                      <p className="text-xs font-medium text-[var(--color-text-secondary)]">{report.recommended_action}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Extracted Fields</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {fieldRows.map(({ label, value }) => (
                    <div key={label} className="group flex flex-col gap-1">
                      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">{label}</p>
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate" title={value}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* FORENSICS TAB */}
          {activeTab === 'forensics' && (
            <motion.div
              key="forensics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* EXIF Metadata */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">EXIF & Image Metadata</p>
                <div className="rounded-lg border border-[var(--color-border)] bg-white overflow-hidden">
                  <div className="grid grid-cols-2 gap-4 p-4 border-b border-[var(--color-border)]">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Format</p>
                      <p className="text-xs font-medium text-[var(--color-text-primary)] mt-1">{metadata.format || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Dimensions</p>
                      <p className="text-xs font-medium text-[var(--color-text-primary)] mt-1">{metadata.dimensions || 'Unknown'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">Software Signature</p>
                      <p className="text-xs font-medium text-[var(--color-text-primary)] mt-1">{metadata.software || 'None detected'}</p>
                    </div>
                  </div>
                  <div className={cn("p-4 text-xs font-medium", metadata.is_edited ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)]" : "bg-[#f8fafc] text-[var(--color-text-secondary)]")}>
                    {metadata.metadata_summary || "No metadata flags."}
                  </div>
                </div>
              </div>

              {/* Security Flags */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Integrity Flags</p>
                {report.red_flags && report.red_flags.length > 0 && report.red_flags[0] !== 'None detected' ? (
                  <div className="flex flex-col gap-2">
                    {report.red_flags.map((flag, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-md bg-[var(--color-danger-bg)] px-3 py-2.5">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-danger)]" />
                        <span className="text-xs font-medium text-[var(--color-danger)]">{flag.replace(/[🔴🟡]/g, '')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-md bg-[var(--color-success-bg)] px-3 py-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
                    <span className="text-xs font-medium text-[var(--color-success)]">No security flags detected. Image passes basic integrity checks.</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* RAW TAB */}
          {activeTab === 'raw' && (
            <motion.div
              key="raw"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative rounded-lg bg-[#0f172a] p-4 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-8 bg-[#1e293b] flex items-center px-4">
                  <span className="text-[10px] font-mono font-medium text-slate-400">verification_payload.json</span>
                </div>
                <div className="mt-6 max-h-[300px] overflow-y-auto custom-scrollbar">
                  <pre className="text-[11px] font-mono leading-relaxed text-slate-300 whitespace-pre-wrap">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] bg-[#f8fafc] px-6 py-4">
        <button
          onClick={handleDownloadPdf}
          disabled={downloading || !result.document_id}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 py-2 text-xs font-medium text-white shadow-sm border-none cursor-pointer transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
        >
          <Download className="h-4 w-4" />
          {downloading ? 'Exporting...' : 'Export PDF'}
        </button>
      </div>
    </div>
  );
}
