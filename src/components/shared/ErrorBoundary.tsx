import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
          <h2 className="text-2xl font-bold">Oops, something went wrong!</h2>
          <p className="text-muted-foreground">
            {this.state.error?.message || 'Wystąpił nieoczekiwany błąd'}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
          >
            Back to home page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 