export type ErrorSeverity = "info" | "warning" | "error" | "critical";

export interface BackendErrorPayload {
    success: false;
    error: {
        message: string;
        code: string;
        severity: ErrorSeverity;
        color: string;
        icon: string;
        extra?: Record<string, unknown>;
        errorId: string;
    };
}

export interface AppErrorOptions {
    message: string;
    statusCode: number;
    severity: ErrorSeverity;
    color: string;
    icon: string;
    retryable?: boolean;
    silent?: boolean;
    metadata?: Record<string, unknown>;
    errorId?: string;
}
