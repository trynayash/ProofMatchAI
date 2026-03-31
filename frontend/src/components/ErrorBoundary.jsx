import { Component } from 'react';

/**
 * Global Error Boundary — prevents white-screen crashes.
 * Catches any unhandled JS error in the React component tree
 * and shows a recovery UI instead of a blank page.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg,#f8fafc)] px-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="h-7 w-7 text-red-500">
                <path
                  d="M85.57,446.25H426.43a32,32,0,0,0,28.17-47.17L284.18,82.58c-12.09-22.44-44.27-22.44-56.36,0L57.4,399.08A32,32,0,0,0,85.57,446.25Z"
                  fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"
                />
                <path
                  d="M250.26,195.39l5.74,122,5.73-121.95a5.74,5.74,0,0,0-5.79-6h0A5.74,5.74,0,0,0,250.26,195.39Z"
                  fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"
                />
                <path d="M256,397.25a20,20,0,1,1,20-20A20,20,0,0,1,256,397.25Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="mb-2 text-lg font-semibold text-[var(--color-text-primary,#1e293b)]">
              Something went wrong
            </h2>
            <p className="mb-6 text-sm text-[var(--color-text-muted,#94a3b8)]">
              An unexpected error occurred. This has been logged and we're working on a fix.
            </p>
            <button
              onClick={this.handleReset}
              className="rounded-lg bg-[var(--color-accent,#6366f1)] px-6 py-2.5 text-sm font-medium text-white shadow-sm border-none cursor-pointer transition-colors hover:opacity-90"
            >
              Return to Home
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-[var(--color-text-muted,#94a3b8)]">
                  Error details
                </summary>
                <pre className="mt-2 max-h-32 overflow-auto rounded-md bg-[#f1f5f9] p-3 text-[10px] text-[#64748b] whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
