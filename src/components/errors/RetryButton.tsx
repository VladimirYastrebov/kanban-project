import { Button } from "@/components/ui/button";

export function RetryButton({ onRetry }: { onRetry: () => void }) {
    return (
        <Button onClick={onRetry} variant="secondary" size="sm">
            Retry
        </Button>
    );
}
