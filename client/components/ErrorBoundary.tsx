import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props { children?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<Props, State> {
	public state: State = { hasError: false, error: null };

	public static getDerivedStateFromError(error: Error): State {
		console.error("ErrorBoundary caught:", error);
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Uncaught error:", error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return (
				<div style={{ padding: 24, background: "#000", color: "#fff", minHeight: "100vh" }}>
					<h1 style={{ color: "red", fontSize: 24 }}>Ошибка рендера</h1>
					<pre style={{ background: "#300", padding: 16, borderRadius: 8, overflow: "auto", whiteSpace: "pre-wrap" }}>
						{this.state.error?.message}
						{"\n\n"}
						{this.state.error?.stack}
					</pre>
					<button
						onClick={() => window.location.reload()}
						style={{ marginTop: 16, padding: "8px 16px", background: "#4182F9", color: "#fff", border: 0, borderRadius: 8 }}
					>
						Перезагрузить
					</button>
				</div>
			);
		}
		return this.props.children;
	}
}

export default ErrorBoundary;