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
    setImagePreview(URL.createObjectURL(file));
    toast.loading('Starting verification pipeline...', { id: 'verify-toast' });

    try {
      // Step 1: Upload
      const uploadResponse = await uploadImage(file);
      const uploadData = uploadResponse.data;

      // Step 2-4: Verify (backend runs the pipeline)
      setCurrentStep(2);

      // Simulate step progression while backend processes
      const stepTimer1 = setTimeout(() => setCurrentStep(3), 3000);
      const stepTimer2 = setTimeout(() => setCurrentStep(4), 6000);

      const verifyResponse = await verifyScreenshot(
        uploadData.image_base64,
        uploadData.mime_type,
        uploadData.file_uri
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
    setImagePreview(null);
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
