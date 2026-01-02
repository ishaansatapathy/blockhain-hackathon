import React from "react";

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <h2 style={{ color: "#b91c1c" }}>Something went wrong rendering this section.</h2>
          <pre style={{ whiteSpace: "pre-wrap", color: "#111" }}>{String(this.state.error)}</pre>
        </div>
      );
    }

    return this.props.children as any;
  }
}

export default ErrorBoundary;
