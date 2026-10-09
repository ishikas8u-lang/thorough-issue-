import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Campus Assist ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          style={{
            minHeight: '60dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              background: 'var(--color-surface, #1e222b)',
              border: '1px solid var(--color-border, rgba(255,255,255,0.1))',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.5))',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <AlertTriangle size={24} />
            </div>

            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-text-main, #ffffff)',
                marginBottom: '0.5rem',
              }}
            >
              Something went wrong
            </h2>

            <p
              style={{
                fontSize: '0.9rem',
                color: 'var(--color-text-muted, #94a3b8)',
                lineHeight: 1.5,
                marginBottom: '1.5rem',
              }}
            >
              An unexpected issue occurred while rendering this page. You can safely reload the page or return to the main dashboard.
            </p>

            <button
              type="button"
              onClick={this.handleReset}
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                minHeight: '44px',
                padding: '0.6rem 1.4rem',
                cursor: 'pointer',
                margin: '0 auto',
              }}
            >
              <RotateCcw size={16} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
