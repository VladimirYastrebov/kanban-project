import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { BoardPage } from "@/pages/BoardPage";
import { ErrorPageRoutes } from "@/pages/errors/ErrorPageRoutes";
import { ErrorToast } from "@/components/errors/ErrorToast";
import { ErrorModal } from "@/components/errors/ErrorModal";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";

function App() {
    return (
        <ErrorProvider>
            <ErrorBoundary>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<BoardPage />} />
                        <Route path="/errors/*" element={<ErrorPageRoutes />} />
                        <Route path="*" element={<Navigate to="/errors/404" replace />} />
                    </Routes>
                    <ErrorToast />
                    <ErrorModal />
                </BrowserRouter>
            </ErrorBoundary>
        </ErrorProvider>
    );
}

export default App;
