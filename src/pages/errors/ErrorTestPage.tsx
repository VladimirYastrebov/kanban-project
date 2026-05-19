import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const errorRoutes = [
    { label: "Offline", path: "/errors/offline" },
    { label: "Server Error", path: "/errors/500" },
    { label: "Authentication", path: "/errors/401" },
    { label: "Permission Denied", path: "/errors/403" },
    { label: "Not Found", path: "/errors/404" },
    { label: "Conflict", path: "/errors/409" },
    { label: "Too Many Requests", path: "/errors/429" },
    { label: "Bad Request", path: "/errors/400" },
    { label: "Maintenance", path: "/errors/maintenance" },
];

export function ErrorTestPage() {
    return (
        <main className="min-h-dvh bg-background">
            <div className="container mx-auto px-4 py-10">
                <div className="rounded-3xl border border-slate-200/10 bg-slate-950/90 p-8 shadow-2xl">
                    <h1 className="text-3xl font-semibold text-white">Error Test Page</h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Use the buttons below to preview each global error screen.
                    </p>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {errorRoutes.map((errorRoute) => (
                            <Button key={errorRoute.path} asChild>
                                <Link to={errorRoute.path}>{errorRoute.label}</Link>
                            </Button>
                        ))}
                    </div>

                    <div className="mt-8 text-sm text-slate-500">
                        <p>
                            You can also use this page as a QA checklist for the app's error flows.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
