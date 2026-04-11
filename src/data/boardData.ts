import type { Column } from "../types/kanban.ts";

export const BOARD: Column[] = [
    {
        id: "todo",
        title: "Todo",
        cards: [],
    },
    {
        id: "in_progress",
        title: "In Progress",
        cards: [],
    },
    {
        id: "completed",
        title: "Completed",
        cards: [],
    },
];
