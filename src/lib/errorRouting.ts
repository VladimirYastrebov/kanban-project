import type { NavigateFunction } from "react-router-dom";
import {
    AppError,
    OfflineAppError,
    ServerAppError,
    AuthenticationAppError,
    PermissionDeniedAppError,
    NotFoundAppError,
    ConflictAppError,
} from "./errors";

export interface ErrorRoutingOptions {
    navigate: NavigateFunction;
    notify: (error: AppError) => void;
}

export const handleError = (error: unknown, options: ErrorRoutingOptions): void => {
    if (!(error instanceof AppError)) {
        console.error("Non-AppError caught:", error);
        return;
    }
    
    const { navigate, notify } = options;

    notify(error);

    if (error instanceof OfflineAppError) {
        navigate("/errors/offline");
    } else if (error instanceof ServerAppError) {
        navigate("/errors/server-error");
    } else if (error instanceof AuthenticationAppError) {
        navigate("/errors/401");
    } else if (error instanceof PermissionDeniedAppError) {
        navigate("/errors/403");
    } else if (error instanceof NotFoundAppError) {
        navigate("/errors/not-found");
    } else if (error instanceof ConflictAppError) {
        navigate("/errors/409");
    }
};
