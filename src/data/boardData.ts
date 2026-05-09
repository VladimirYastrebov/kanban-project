import type { Column } from "../types/kanban.ts";

export const BOARD: Column[] = [
    {
        id: "todo",
        title: "To Do",
        cards: [],
    },
    {
        id: "in_progress",
        title: "In Progress",
        cards: [],
    },
    {
        id: "completed",
        title: "Done",
        cards: [],
    },
];
