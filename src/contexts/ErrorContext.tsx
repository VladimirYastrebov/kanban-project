import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AppError } from "@/lib/errors";

export interface ErrorAction {
    label: string;
    callback: () => void;
}

export interface ErrorContextValue {
    toasts: AppError[];
    modalError: AppError | null;
    notifyError: (error: AppError) => void;
    showErrorModal: (error: AppError) => void;
    dismissToast: (errorId: string) => void;
    clearModal: () => void;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: React.ReactNode }) => {
    const [toasts, setToasts] = useState<AppError[]>([]);
    const [modalError, setModalError] = useState<AppError | null>(null);

    const notifyError = useCallback((error: AppError) => {
        if (error.silent) {
            return;
        }

        setToasts((current) => [error, ...current].slice(0, 5));
        if (error.severity === "critical") {
            setModalError(error);
        }
    }, []);

    const showErrorModal = useCallback((error: AppError) => {
        setModalError(error);
    }, []);

    const dismissToast = useCallback((errorId: string) => {
        setToasts((current) => current.filter((toast) => toast.errorId !== errorId));
    }, []);

    const clearModal = useCallback(() => {
        setModalError(null);
    }, []);

    const value = useMemo(
        () => ({
            toasts,
            modalError,
            notifyError,
            showErrorModal,
            dismissToast,
            clearModal,
        }),
        [toasts, modalError, notifyError, showErrorModal, dismissToast, clearModal],
    );

    return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};

export const useError = (): ErrorContextValue => {
    const context = useContext(ErrorContext);
    if (!context) {
        throw new Error("useError must be used within ErrorProvider");
    }
    return context;
};
