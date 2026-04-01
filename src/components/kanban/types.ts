export type Priority = "low" | "medium" | "high";
export type Tag = "Web" | "Mobile" | "Design";
export type Tone = "slate" | "emerald" | "violet" | "amber" | "rose";

export type Assignee = { id: string; name: string; tone: Tone };
export type Card = {
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    tags: Tag[];
    date: string;
    assignees: Assignee[];
};
type ColumnTitle = "Todo" | "In Progress" | "Completed"
export type Column = { id: string; title: ColumnTitle; cards: Card[] };

export type NewCardInput = {
    title: string;
    description?: string;
    priority: Priority;
    tags: Tag[];
    assigneeNames: string[];
};
