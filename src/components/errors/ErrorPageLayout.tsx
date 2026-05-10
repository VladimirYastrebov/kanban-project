import type { ReactNode } from "react";

interface ErrorPageLayoutProps {
    icon: string;
    title: string;
    description: string;
    actions: ReactNode;
    color?: string;
}

export function ErrorPageLayout({
    icon,
    title,
    description,
    actions,
    color,
}: ErrorPageLayoutProps) {
    return (
        <main className="min-h-dvh bg-slate-950 text-white">
            <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-10">
                <div className="max-w-2xl rounded-[2rem] border border-white/10 bg-slate-900/95 p-10 shadow-2xl backdrop-blur-xl">
                    <div className="flex flex-col gap-6 text-center">
                        <div
                            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-4xl"
                            style={{ color: color ?? "#38bdf8" }}
                        >
                            {icon}
                        </div>
                        <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                                Error
                            </p>
                            <h1 className="mt-4 text-4xl font-semibold text-white">{title}</h1>
                            <p className="mt-4 text-base leading-7 text-slate-300">{description}</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">{actions}</div>
                    </div>
                </div>
            </div>
        </main>
    );
}
