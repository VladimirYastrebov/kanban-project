import type { Card } from "../../types/kanban";
import { Badge } from "@/components/ui/badge";
import {
    Card as UiCard,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

function initials(name: string) {
    const parts = name.split(" ").filter(Boolean);
    return (parts[0]?.[0] ?? "").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}

function priorityClass(priority: Card["priority"]) {
    switch (priority) {
        case "low":
            return "border-emerald-200 bg-emerald-100 text-emerald-900";
        case "medium":
            return "border-amber-200 bg-amber-100 text-amber-900";
        case "high":
            return "border-rose-200 bg-rose-100 text-rose-900";
    }
}

function tagClass(tag: Card["tags"][number]) {
    switch (tag) {
        case "Web":
            return "border-transparent bg-violet-600 text-white";
        case "Mobile":
            return "border-transparent bg-fuchsia-600 text-white";
        case "Design":
            return "border-transparent bg-sky-600 text-white";
    }
}

function avatarClass(tone: Card["assignees"][number]["tone"]) {
    switch (tone) {
        case "slate":
            return "bg-slate-200 text-slate-900";
        case "emerald":
            return "bg-emerald-200 text-emerald-950";
        case "violet":
            return "bg-violet-200 text-violet-950";
        case "amber":
            return "bg-amber-200 text-amber-950";
        case "rose":
            return "bg-rose-200 text-rose-950";
    }
}

export function KanbanCard({ card }: { card: Card }) {
    return (
        <UiCard size="sm">
            <CardHeader className="gap-2">
                <div className="flex items-center justify-between gap-3">
                    <Badge
                        variant="outline"
                        className={`capitalize ${priorityClass(card.priority)}`}
                    >
                        {card.priority}
                    </Badge>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                        {card.tags.map((tag) => (
                            <Badge key={tag} className={tagClass(tag)}>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>

                <CardTitle className="text-sm">{card.title}</CardTitle>
            </CardHeader>

            {card.description ? (
                <CardContent className="pt-0 text-sm text-muted-foreground">
                    {card.description}
                </CardContent>
            ) : null}

            <CardFooter className="flex items-center justify-between">
                <time className="text-xs text-muted-foreground">{card.date}</time>
                <div className="flex items-center justify-end" aria-label="Assignees">
                    {card.assignees.map((a, idx) => (
                        <span
                            key={a.id}
                            className={`grid size-8 place-items-center rounded-full border text-[11px] font-semibold ${avatarClass(a.tone) ?? "bg-muted text-foreground"}`}
                            style={{ marginLeft: idx === 0 ? 0 : -6 }}
                            title={a.name}
                        >
                            {initials(a.name)}
                        </span>
                    ))}
                </div>
            </CardFooter>
        </UiCard>
    );
}
