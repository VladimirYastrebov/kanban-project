import { Component, type ErrorInfo, type ReactNode } from "react";
import { FullscreenError } from "@/components/errors/FullscreenError";
import { AppError } from "@/lib/errors";

interface ErrorBoundaryState {
    error: AppError | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
    state: ErrorBoundaryState = { error: null };

    static getDerivedStateFromError(error: Error) {
        return {
            error: new AppError({
                message: error.message || "Unexpected application error",
                statusCode: 500,
                severity: "critical",
                color: "#991B1B",
                icon: "💥",
                retryable: true,
                silent: false,
                metadata: { stack: error.stack },
            }),
        };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("ErrorBoundary caught an exception:", error, info.componentStack);
    }

    render() {
        if (this.state.error) {
            return <FullscreenError error={this.state.error} />;
        }

        return this.props.children;
    }
}
