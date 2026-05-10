import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useError } from "@/contexts/ErrorContext";

export function ErrorModal() {
    const { modalError, clearModal } = useError();

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                clearModal();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [clearModal]);

    if (!modalError) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="w-full max-w-lg rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
                <div className="flex items-start gap-4">
                    <span className="text-4xl">{modalError.icon}</span>
                    <div className="flex-1 space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                {modalError.message}
                            </h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Error ID: {modalError.errorId}
                            </p>
                        </div>
                        {modalError.metadata?.fieldErrors ? (
                            <pre className="rounded-2xl bg-slate-100 p-4 text-xs text-slate-700">
                                {JSON.stringify(modalError.metadata.fieldErrors, null, 2)}
                            </pre>
                        ) : null}
                        <div className="flex flex-wrap gap-3 justify-end">
                            <Button variant="secondary" size="sm" onClick={clearModal}>
                                Dismiss
                            </Button>
                            {modalError.retryable ? (
                                <Button size="sm" onClick={() => window.location.reload()}>
                                    Retry
                                </Button>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
