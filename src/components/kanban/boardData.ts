import type { Column } from "./types";

export const BOARD: Column[] = [
    {
        id: "todo",
        title: "Todo",
        cards: [
            {
                id: "c1",
                title: "Write clearer task cards",
                description: "Add a description area that wraps naturally on smaller screens.",
                priority: "low",
                tags: ["Mobile", "Web"],
                date: "Mar 17, 2026",
                assignees: [{ id: "u1", name: "Vlad I.", tone: "violet" }],
            },
            {
                id: "c2",
                title: "Define tag palette",
                priority: "low",
                tags: ["Mobile", "Web"],
                date: "Mar 16, 2026",
                assignees: [{ id: "u2", name: "Sam K.", tone: "slate" }],
            },
        ],
    },
    {
        id: "in_progress",
        title: "In Progress",
        cards: [
            {
                id: "c3",
                title: "Improve avatar stack",
                priority: "medium",
                tags: ["Mobile", "Web"],
                date: "Mar 15, 2026",
                assignees: [
                    { id: "u3", name: "Alex P.", tone: "emerald" },
                    { id: "u4", name: "Jordan L.", tone: "amber" },
                ],
            },
            {
                id: "c4",
                title: "Add board header actions",
                priority: "low",
                tags: ["Web"],
                date: "Mar 14, 2026",
                assignees: [{ id: "u5", name: "Nina S.", tone: "rose" }],
            },
        ],
    },
    {
        id: "completed",
        title: "Completed",
        cards: [
            {
                id: "c5",
                title: "Scaffold Vite + shadcn/ui",
                priority: "high",
                tags: ["Mobile", "Web"],
                date: "Mar 12, 2026",
                assignees: [
                    { id: "u6", name: "Mia R.", tone: "slate" },
                    { id: "u7", name: "Chris D.", tone: "violet" },
                ],
            },
        ],
    },
];
