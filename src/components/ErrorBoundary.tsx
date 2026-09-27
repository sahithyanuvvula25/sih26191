import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
    this.handleRetry = this.handleRetry.bind(this);
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Bhoosethu UI Error caught by boundary:', error, errorInfo);
  }

  public handleRetry(): void {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 bg-amber-50/70 border border-amber-200 rounded-xl max-w-2xl mx-auto text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {this.props.fallbackTitle || 'Unable to load component data'}
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            {this.state.error?.message ||
              'A temporary telemetry or GIS layer rendering error occurred. The rest of the Bhoosethu decision platform remains operational.'}
          </p>
          <div className="pt-2">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
