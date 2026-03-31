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
