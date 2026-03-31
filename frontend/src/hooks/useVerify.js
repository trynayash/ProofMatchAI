import { useState, useCallback } from 'react';
import { uploadImage, verifyScreenshot } from '@/lib/api';
import { toast } from 'sonner';

const STEPS = [
  { key: 'idle', label: 'Ready' },
  { key: 'uploading', label: 'Uploading Image' },
  { key: 'extracting', label: 'Extracting Fields' },
  { key: 'verifying', label: 'Analyzing Integrity' },
  { key: 'checking', label: 'Checking Duplicates' },
  { key: 'done', label: 'Complete' },
];

export function useVerify() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const startVerification = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentStep(1);

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    toast.loading('Starting verification pipeline...', { id: 'verify-toast' });

    try {
      // Step 1: Upload
      // NOTE: API interceptor already unwraps response.data
      const uploadData = await uploadImage(file);

      if (!uploadData?.data) {
        throw new Error('Upload failed: no data returned from server');
      }

      // Step 2-4: Verify (backend runs the pipeline)
      setCurrentStep(2);

      // Simulate step progression while backend processes
      const stepTimer1 = setTimeout(() => setCurrentStep(3), 3000);
      const stepTimer2 = setTimeout(() => setCurrentStep(4), 6000);

      const verifyResponse = await verifyScreenshot(
        uploadData.data.image_base64,
        uploadData.data.mime_type,
        uploadData.data.file_uri
      );

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      // Step 5: Done
      setCurrentStep(5);
      setResult(verifyResponse.data);
      toast.success('Verification complete!', { id: 'verify-toast' });
    } catch (err) {
      console.error('Verification flow error:', err);
      const msg = err.response?.data?.error || err.message || 'Verification failed';
      setError(msg);
      setCurrentStep(0);
      toast.error(`Verification Failed: ${msg}`, { id: 'verify-toast' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsLoading(false);
    setResult(null);
    setError(null);
    // Revoke object URL to prevent memory leaks
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  return {
    steps: STEPS,
    currentStep,
    isLoading,
    result,
    error,
    imagePreview,
    startVerification,
    reset,
  };
}
