import { CheckCircle2, Loader2 } from '@/components/icons';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function Stepper({ steps, currentStep }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-sm font-semibold text-[var(--color-text-primary)]">Agent Reasoning Pipeline</h3>
      <div className="relative flex justify-between">
        {/* Progress Line */}
        <div className="absolute left-0 top-3 h-0.5 w-full bg-[var(--color-border)] -z-10" />
        <motion.div 
          className="absolute left-0 top-3 h-0.5 bg-[var(--color-accent)] -z-10"
          initial={{ width: 0 }}
          animate={{ width: `${(Math.max(currentStep - 1, 0) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {steps.map((step, index) => {
          const isCompleted = currentStep > index + 1;
          const isActive = currentStep === index + 1;
          const isPending = currentStep < index + 1;

          return (
            <div key={step.key || index} className="relative flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted ? 'var(--color-success)' : isActive ? 'var(--color-accent)' : 'white',
                  borderColor: isCompleted || isActive ? 'transparent' : 'var(--color-border)',
                  color: isCompleted || isActive ? 'white' : 'var(--color-text-muted)'
                }}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px] font-medium shadow-sm z-10",
                  isPending && "bg-white"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : isActive ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </motion.div>
              
              <div className="absolute -bottom-6 flex w-24 flex-col items-center text-center">
                <span
                  className={cn(
                    "text-[10px] font-medium tracking-wide transition-colors",
                    isActive ? "text-[var(--color-accent)]" : isCompleted ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text-muted)]"
                  )}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8" />
    </div>
  );
}
