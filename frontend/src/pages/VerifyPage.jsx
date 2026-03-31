import { useVerify } from '@/hooks/useVerify';
import UploadZone from '@/components/UploadZone';
import Stepper from '@/components/Stepper';
import ResultCard from '@/components/ResultCard';
import { AlertCircle, RotateCcw } from '@/components/icons';

export default function VerifyPage() {
  const {
    steps,
    currentStep,
    isLoading,
    result,
    error,
    imagePreview,
    startVerification,
    reset,
  } = useVerify();

  const handleFileSelect = (file) => {
    startVerification(file);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">Verify Screenshot</h1>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          Upload a UPI payment receipt to verify its authenticity
        </p>
      </div>

      {/* Upload Zone */}
      <UploadZone
        onFileSelect={handleFileSelect}
        imagePreview={imagePreview}
        onClear={reset}
        disabled={isLoading}
      />

      {/* Stepper — only show when processing */}
      {currentStep > 0 && (
        <div className="mt-6 animate-fade-in">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>
      )}


      {/* Error */}
      {error && !isLoading && (
        <div className="mt-6 animate-fade-in">
          <div className="rounded-lg border border-[var(--color-danger,#fca5a5)] bg-[var(--color-danger-bg,#fef2f2)] px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger,#dc2626)]" />
              <div>
                <p className="text-sm font-medium text-[var(--color-danger,#dc2626)]">Verification Failed</p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary,#64748b)]">{error}</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="mt-3 flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] cursor-pointer transition-colors hover:bg-[var(--color-bg-elevated)]"
            >
              <RotateCcw className="h-3 w-3" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6">
          <ResultCard result={result} />
          <div className="mt-4 flex justify-center">
            <button
              onClick={reset}
              className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-white px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] cursor-pointer transition-colors hover:bg-[var(--color-bg-elevated)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Verify Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
