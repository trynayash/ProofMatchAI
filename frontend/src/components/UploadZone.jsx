import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, X } from '@/components/icons';

export default function UploadZone({ onFileSelect, imagePreview, onClear, disabled }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    disabled,
  });

  if (imagePreview) {
    return (
      <div className="animate-scale-in">
        <div className="relative overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
          <img
            src={imagePreview}
            alt="Payment screenshot preview"
            className="mx-auto max-h-80 object-contain p-4"
          />
          {!disabled && (
            <button
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md bg-white border border-[var(--color-border)] cursor-pointer transition-colors hover:bg-[var(--color-bg-elevated)]"
            >
              <X className="h-3.5 w-3.5 text-[var(--color-text-secondary)]" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`group rounded-lg border-2 border-dashed transition-all cursor-pointer ${
        isDragActive
          ? 'border-[var(--color-accent)] bg-[var(--color-bg-elevated)]'
          : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)] bg-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} id="upload-zone-input" />
      <div className="flex flex-col items-center justify-center px-6 py-16">
        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
          isDragActive ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]'
        }`}>
          {isDragActive ? (
            <Image className="h-5 w-5" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
        </div>
        <p className="mb-1 text-sm font-medium text-[var(--color-text-primary)]">
          {isDragActive ? 'Drop your screenshot here' : 'Upload payment screenshot'}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Drag & drop or click to browse · JPG, PNG, WEBP · Max 10MB
        </p>
      </div>
      {fileRejections.length > 0 && (
        <p className="px-4 pb-3 text-xs text-[var(--color-danger)]">
          Invalid file. Please use a JPG, PNG, or WEBP image under 10MB.
        </p>
      )}
    </div>
  );
}
