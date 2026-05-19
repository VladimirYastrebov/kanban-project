import { Routes, Route, Navigate } from "react-router-dom";
import { ErrorPageLayout } from "@/components/errors/ErrorPageLayout";
import { Button } from "@/components/ui/button";
import { ErrorTestPage } from "./ErrorTestPage";

const createPage = (
    icon: string,
    title: string,
    description: string,
    action: { label: string; href: string },
) => (
    <ErrorPageLayout
        icon={icon}
        title={title}
        description={description}
        color={
            icon === "💥"
                ? "#991B1B"
                : icon === "🔐"
                  ? "#2563EB"
                  : icon === "⚠️"
                    ? "#F59E0B"
                    : "#0EA5E9"
        }
        actions={
            <>
                <Button asChild>
                    <a href={action.href}>{action.label}</a>
                </Button>
                <Button variant="secondary" asChild>
                    <a href="/">Home</a>
                </Button>
            </>
        }
    />
);

export function ErrorPageRoutes() {
    return (
        <Routes>
            <Route
                path="400"
                element={createPage(
                    "⚠️",
                    "Bad Request",
                    "The request could not be understood by the server due to malformed syntax.",
                    { label: "Try Again", href: "/" },
                )}
            />
            <Route path="401" element={createPage("🔐", "Unauthorized", "You need to sign in to access this page.", { label: "Sign In", href: "/" })} />
            <Route
                path="403"
                element={createPage(
                    "🚫",
                    "Forbidden",
                    "You do not have permission to view this resource.",
                    { label: "Home", href: "/" },
                )}
            />
            <Route
                path="404"
                element={createPage(
                    "🔍",
                    "Page Not Found",
                    "The page you are looking for does not exist.",
                    { label: "Return Home", href: "/" },
                )}
            />
            <Route
                path="409"
                element={createPage(
                    "⚔️",
                    "Conflict",
                    "A conflict occurred while processing your request.",
                    { label: "Retry", href: "/" },
                )}
            />
            <Route
                path="429"
                element={createPage(
                    "⏳",
                    "Too Many Requests",
                    "You've made too many requests. Please wait and try again.",
                    { label: "Retry", href: "/" },
                )}
            />
            <Route
                path="500"
                element={createPage(
                    "💥",
                    "Server Error",
                    "Something went wrong on our end. We're working on it.",
                    { label: "Refresh", href: "/" },
                )}
            />
            <Route
                path="maintenance"
                element={createPage(
                    "🛠️",
                    "Maintenance Mode",
                    "We are updating the system. Please check back shortly.",
                    { label: "Refresh", href: "/" },
                )}
            />
            <Route
                path="offline"
                element={createPage(
                    "📡",
                    "Offline",
                    "Your connection appears to be offline. Check your internet settings.",
                    { label: "Retry", href: "/" },
                )}
            />
            <Route path="test" element={<ErrorTestPage />} />
            <Route path="session-expired" element={createPage("⏰", "Session Expired", "Your session has expired. Please sign in again.", { label: "Sign In", href: "/" })} />
            <Route path="*" element={<Navigate to="/errors/404" replace />} />
        </Routes>
    );
}
