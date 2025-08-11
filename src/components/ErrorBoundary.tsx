import React from "react";
import { useDiagnostics } from "@/diagnostics/DiagnosticsContext";

type BoundaryState = { hasError: boolean };

type BoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

class Boundary extends React.Component<BoundaryProps & { onError: (err: any, info: any) => void }, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    this.props.onError?.(error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-4 text-sm text-muted-foreground">
          Something went wrong. Please refresh and try again.
        </div>
      );
    }
    return this.props.children;
  }
}

export const ErrorBoundary: React.FC<BoundaryProps> = ({ children, fallback }) => {
  const { add } = useDiagnostics();
  return (
    <Boundary
      fallback={fallback}
      onError={(err, info) =>
        add({
          level: "error",
          source: (info?.componentStack?.split("\n")[1]?.trim() || "ErrorBoundary") as string,
          message: String(err?.message || err),
          details: String(err?.stack || ""),
        })
      }
    >
      {children}
    </Boundary>
  );
};
