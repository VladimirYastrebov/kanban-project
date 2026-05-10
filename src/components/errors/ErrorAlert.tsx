import { cn } from "@/lib/utils";
import type { AppError } from "@/lib/errors";

const severityClasses: Record<string, string> = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-red-200 bg-red-50 text-red-900",
    critical: "border-rose-200 bg-rose-50 text-rose-900",
};

export function ErrorAlert({ error }: { error: AppError }) {
    return (
        <div className={cn("rounded-2xl border p-4 shadow-sm", severityClasses[error.severity])}>
            <div className="flex items-start gap-3">
                <span className="text-2xl">{error.icon}</span>
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{error.message}</p>
                        <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-700">
                            {error.errorId}
                        </span>
                    </div>
                    {error.metadata?.fieldErrors ? (
                        <pre className="rounded-md bg-slate-100 p-3 text-xs text-slate-700">
                            {JSON.stringify(error.metadata.fieldErrors, null, 2)}
                        </pre>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
