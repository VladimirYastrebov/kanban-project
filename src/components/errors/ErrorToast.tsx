import { useEffect } from "react";
import { useError } from "@/contexts/ErrorContext";
import { Button } from "@/components/ui/button";

export function ErrorToast() {
    const { toasts, dismissToast } = useError();

    useEffect(() => {
        const timeout = setInterval(() => {
            if (toasts.length > 0) {
                dismissToast(toasts[toasts.length - 1].errorId);
            }
        }, 6500);

        return () => clearInterval(timeout);
    }, [toasts, dismissToast]);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
            {toasts.map((error) => (
                <div
                    key={error.errorId}
                    className="w-[320px] rounded-3xl border bg-white p-4 shadow-xl ring-1 ring-slate-200"
                    style={{ borderColor: error.color }}
                >
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">{error.icon}</span>
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900">{error.message}</p>
                            <p className="mt-1 text-sm text-slate-600">{error.errorId}</p>
                        </div>
                    </div>
                    {error.retryable ? (
                        <div className="mt-4 flex justify-end">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </Button>
                        </div>
                    ) : null}
                </div>
            ))}
        </div>
    );
}
