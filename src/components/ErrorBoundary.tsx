import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw, ShieldAlert, Bug } from "lucide-react";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Misc";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] w-full items-center justify-center p-6 bg-[hsl(var(--background))] animate-in fade-in duration-500">
          <Card className="max-w-md w-full p-8 border-[hsl(var(--destructive)/0.2)] bg-[hsl(var(--destructive)/0.02)] shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]">
                   <ShieldAlert className="h-8 w-8" />
                </div>
                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 ring-4 ring-[hsl(var(--background))]">
                   <Bug className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-black tracking-tight">Something went wrong</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed px-2">
                  An unexpected error occurred in the engine. This usually happens when the API response doesn't match the schema.
                </p>
              </div>

              {this.state.error && (
                <div className="w-full text-left p-3 rounded-lg bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] overflow-hidden">
                   <p className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                     <AlertCircle className="h-3 w-3" /> Error Details
                   </p>
                   <code className="text-[11px] text-[hsl(var(--destructive))] font-mono break-all line-clamp-2">
                     {this.state.error.toString()}
                   </code>
                </div>
              )}

              <div className="flex flex-col w-full gap-2 pt-2">
                <Button 
                  onClick={this.handleReset} 
                  className="w-full font-bold h-11 rounded-xl shadow-lg shadow-[hsl(var(--primary)/0.2)]"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Try Again
                </Button>
                <Button 
                   variant="ghost" 
                   className="w-full text-xs font-bold text-[hsl(var(--muted-foreground))]"
                   onClick={() => window.open('https://github.com/burcineren/auto-admin/issues', '_blank')}
                >
                  Report a bug
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
