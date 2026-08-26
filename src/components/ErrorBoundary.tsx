import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[CareerPath AI] Uncaught error:', error, info.componentStack);
  }

  handleReset = (): void => {
    this.setState({ error: null });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div role="alert" className="flex min-h-screen items-center justify-center bg-slate-950 p-8 text-white">
          <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="text-5xl" aria-hidden="true">🛠️</div>
            <h1 className="mt-4 text-2xl font-extrabold">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-400">
              An unexpected error occurred. Your progress in the current session may be lost — we're sorry.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-black/40 p-3 text-left text-xs text-rose-300">
              {this.state.error.message}
            </pre>
            <button
              onClick={this.handleReset}
              className="mt-6 rounded-full bg-indigo-600 px-6 py-3 font-semibold transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400/50"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
