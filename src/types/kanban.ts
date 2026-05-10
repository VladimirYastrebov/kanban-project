export type Priority = "low" | "medium" | "high";
export type Tag = "Web" | "Mobile" | "Design";
export type Tone = "slate" | "emerald" | "violet" | "amber" | "rose";
export type ColumnTitle = string;

export interface Assignee {
    id: string;
    name: string;
    tone: Tone;
}

export interface Card {
    id: string;
    title: string;
    description?: string;
    priority: Priority;
    tags: string[];
    date: string;
    assignees: Assignee[];
    column?: string;
    order?: number;
}

export interface Column {
    id: string;
    title: ColumnTitle;
    order?: number;
    cards?: Card[];
}

export interface NewCardInput {
    title: string;
    description?: string;
    priority: Priority;
    tags: string[];
    assigneeNames: string[];
}

export interface BackendCard {
    id: string;
    title: string;
    description: string;
    priority: string;
    tags: string;
    date: string;
    assignees: string;
    column: string;
    order: number;
}

export interface BackendColumn {
    id: string;
    title: string;
    order: number;
    cards?: BackendCard[];
}

export interface CreateCardRequest {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    tags: string;
    date: string;
    assignees: string;
    column: string;
    order: number;
}

export interface UpdateCardRequest {
    title?: string;
    description?: string;
    priority?: Priority;
    tags?: string;
    assignees?: string;
    column?: string;
    order?: number;
}

export type PartialCard = Partial<Card>;
