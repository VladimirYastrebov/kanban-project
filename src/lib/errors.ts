import axios, { type AxiosError } from "axios";
import type { AppErrorOptions, BackendErrorPayload, ErrorSeverity } from "@/types/error";

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly severity: ErrorSeverity;
    public readonly color: string;
    public readonly icon: string;
    public readonly retryable: boolean;
    public readonly silent: boolean;
    public readonly metadata: Record<string, unknown>;
    public readonly errorId: string;
    public readonly originalError?: unknown;

    constructor(options: AppErrorOptions) {
        super(options.message);
        this.name = "AppError";
        this.statusCode = options.statusCode;
        this.severity = options.severity;
        this.color = options.color;
        this.icon = options.icon;
        this.retryable = options.retryable ?? false;
        this.silent = options.silent ?? false;
        this.metadata = options.metadata ?? {};
        this.errorId = options.errorId ?? AppError.buildErrorId();
        this.originalError = options.metadata?.originalError;

        if (
            typeof (
                Error as unknown as {
                    captureStackTrace?: (error: Error, constructorOpt?: Function) => void;
                }
            ).captureStackTrace === "function"
        ) {
            (
                Error as unknown as {
                    captureStackTrace: (error: Error, constructorOpt?: Function) => void;
                }
            ).captureStackTrace(this, AppError);
        }
    }

    public static buildErrorId(): string {
        return `ERR-${new Date()
            .toISOString()
            .replace(/[^0-9]/g, "")
            .slice(0, 14)}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    }
}

export class ValidationAppError extends AppError {
    constructor(options: AppErrorOptions) {
        super(
            Object.assign(
                {
                    severity: "warning",
                    color: "#F59E0B",
                    icon: "⚠️",
                    retryable: false,
                },
                options,
            ),
        );
        this.name = "ValidationAppError";
    }
}

export class AuthenticationAppError extends AppError {
    constructor(options: AppErrorOptions) {
        super(
            Object.assign(
                {
                    severity: "warning",
                    color: "#2563EB",
                    icon: "🔐",
                    retryable: false,
                },
                options,
            ),
        );
        this.name = "AuthenticationAppError";
    }
}

export class PermissionDeniedAppError extends AppError {
    constructor(options: AppErrorOptions) {
        super(
            Object.assign(
                {
                    severity: "error",
                    color: "#DC2626",
                    icon: "🚫",
                    retryable: false,
                },
                options,
            ),
        );
        this.name = "PermissionDeniedAppError";
    }
}

export class NotFoundAppError extends AppError {
    constructor(options: AppErrorOptions) {
        super(
            Object.assign(
                {
                    severity: "warning",
                    color: "#0EA5E9",
                    icon: "🔍",
                    retryable: false,
                },
                options,
            ),
        );
        this.name = "NotFoundAppError";
    }
}

export class ConflictAppError extends AppError {
    constructor(
        options: Omit<
            AppErrorOptions,
            "severity" | "color" | "icon"
        >
    ) {
        super(
            Object.assign(
                {
                    severity: "warning" as const,
                    color: "#F97316",
                    icon: "⚔️",
                    retryable: false,
                },
                options,
            ),
        );

        this.name = "ConflictAppError";
    }
}

export class RateLimitAppError extends AppError {
    constructor(options: AppErrorOptions) {
        super(
            Object.assign(
                {
                    severity: "warning",
                    color: "#F59E0B",
                    icon: "⏳",
                    retryable: true,
                },
                options,
            ),
        );
        this.name = "RateLimitAppError";
    }
}

export class ServerAppError extends AppError {
    constructor(options: AppErrorOptions) {
        super(
            Object.assign(
                {
                    severity: "critical",
                    color: "#991B1B",
                    icon: "💥",
                    retryable: true,
                },
                options,
            ),
        );
        this.name = "ServerAppError";
    }
}

export class OfflineAppError extends AppError {
    constructor(message = "You appear to be offline.") {
        super({
            message,
            statusCode: 0,
            severity: "warning",
            color: "#0EA5E9",
            icon: "📡",
            retryable: true,
            silent: false,
            metadata: {},
        });
        this.name = "OfflineAppError";
    }
}

export const mapBackendError = (payload: BackendErrorPayload, statusCode: number): AppError => {
    const baseOptions = {
        message: payload.error.message,
        statusCode,
        severity: payload.error.severity,
        color: payload.error.color,
        icon: payload.error.icon,
        retryable: payload.error.severity === "warning" && statusCode === 429,
        silent: false,
        metadata: { ...payload.error.extra, errorId: payload.error.errorId },
        errorId: payload.error.errorId,
    };

    switch (statusCode) {
        case 400:
            return new ValidationAppError(baseOptions);
        case 401:
            return new AuthenticationAppError(baseOptions);
        case 403:
            return new PermissionDeniedAppError(baseOptions);
        case 404:
            return new NotFoundAppError(baseOptions);
        case 409:
            return new ConflictAppError(baseOptions);
        case 429:
            return new RateLimitAppError(baseOptions);
        case 500:
        default:
            return new ServerAppError(baseOptions);
    }
};

export const normalizeAxiosError = (error: unknown): AppError => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<BackendErrorPayload>;

        if (axiosError.response?.data?.error) {
            return mapBackendError(axiosError.response.data, axiosError.response.status);
        }

        if (axiosError.request) {
            return new OfflineAppError();
        }

        return new AppError({
            message: axiosError.message,
            statusCode: axiosError.response?.status ?? 500,
            severity: "error",
            color: "#DC2626",
            icon: "❌",
            retryable: false,
            silent: false,
            metadata: { originalError: axiosError.toJSON() },
        });
    }

    return new AppError({
        message: error instanceof Error ? error.message : "An unknown error occurred.",
        statusCode: 500,
        severity: "error",
        color: "#DC2626",
        icon: "❌",
        retryable: false,
        silent: false,
        metadata: { originalError: error },
    });
};
