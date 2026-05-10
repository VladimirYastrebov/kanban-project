import { Button } from "@/components/ui/button";
import type { AppError } from "@/lib/errors";

export function FullscreenError({ error }: { error: AppError }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 px-4 py-10 text-white">
            <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-slate-900 p-10 shadow-2xl">
                <div className="space-y-8 text-center">
                    <div
                        className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white/10 text-5xl"
                        style={{ color: error.color }}
                    >
                        {error.icon}
                    </div>
                    <div>
                        <h1 className="text-4xl font-semibold">{error.message}</h1>
                        <p className="mt-4 text-sm leading-7 text-slate-300">
                            {typeof error.metadata?.description === "string"
                                ? error.metadata.description
                                : "A critical problem has occurred. Please reload or contact support."}
                        </p>
                        <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-500">
                            Error ID: {error.errorId}
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Button onClick={() => window.location.reload()}>Reload</Button>
                        <Button variant="secondary" onClick={() => window.history.back()}>
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
