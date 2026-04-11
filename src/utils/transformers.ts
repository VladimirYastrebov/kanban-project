import type {
    Card as FrontendCard,
    Column as FrontendColumn,
    BackendCard,
    BackendColumn,
    CreateCardRequest,
    UpdateCardRequest,
    Assignee,
    ColumnTitle,
} from "../types/kanban.ts";

export const formatDateForBackend = (frontendDate: string): string => {
    if (!frontendDate) return new Date().toISOString().split("T")[0];

    try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(frontendDate)) {
            return frontendDate;
        }

        const date = new Date(frontendDate);
        if (isNaN(date.getTime())) {
            console.warn("Invalid date:", frontendDate);
            return new Date().toISOString().split("T")[0];
        }

        return date.toISOString().split("T")[0];
    } catch (error) {
        console.error("Date parsing error:", error);
        return new Date().toISOString().split("T")[0];
    }
};

export const formatDateForFrontend = (backendDate: string): string => {
    if (!backendDate) return "";

    try {
        const date = new Date(backendDate);
        if (isNaN(date.getTime())) return backendDate;

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch (error) {
        console.error("Date formatting error:", error);
        return backendDate;
    }
};

export const tagsToString = (tags: string[] | string): string => {
    if (Array.isArray(tags)) {
        return tags.filter((t) => t.trim()).join(",");
    }
    return tags || "";
};

export const stringToTags = (tagsString: string): string[] => {
    if (!tagsString) return [];
    return tagsString
        .split(",")
        .filter((tag) => tag.trim())
        .map((tag) => tag.trim());
};

const generateAssigneeId = (name: string, index: number): string => {
    return `assignee-${name.toLowerCase().replace(/\s/g, "-")}-${index}`;
};

const getToneFromName = (name: string): string => {
    const tones = ["slate", "emerald", "violet", "amber", "rose", "blue", "green", "purple"];
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return tones[hash % tones.length];
};

export const assigneesToString = (assignees: Assignee[] | string): string => {
    if (Array.isArray(assignees)) {
        return assignees.map((a) => a.name).join(", ");
    }
    return assignees || "";
};

export const stringToAssignees = (assigneesString: string): Assignee[] => {
    if (!assigneesString) return [];

    return assigneesString.split(",").map((name, index) => ({
        id: generateAssigneeId(name, index),
        name: name.trim(),
        tone: getToneFromName(name.trim()) as any,
    }));
};

export const mapTitleToBackend = (frontendTitle: string): string => {
    const mapping: Record<string, string> = {
        Todo: "toDo",
        "In Progress": "inProgress",
        Completed: "done",
    };
    return mapping[frontendTitle] || frontendTitle.toLowerCase().replace(/\s/g, "");
};

export const mapTitleToFrontend = (backendTitle: string): string => {
    const mapping: Record<string, string> = {
        toDo: "Todo",
        inProgress: "In Progress",
        done: "Completed",
    };
    return mapping[backendTitle] || backendTitle;
};

export const transformCardToBackend = (
    frontendCard: Partial<FrontendCard>,
    columnId: string,
): CreateCardRequest => {
    return {
        id: frontendCard.id || crypto.randomUUID(),
        title: frontendCard.title || "Untitled",
        description: frontendCard.description || "",
        priority: frontendCard.priority || "medium",
        tags: tagsToString(frontendCard.tags || []),
        date: formatDateForBackend(frontendCard.date || new Date().toISOString()),
        assignees: assigneesToString(frontendCard.assignees || []),
        column: columnId,
        order: frontendCard.order ?? 0,
    };
};

export const transformCardToFrontend = (backendCard: BackendCard): FrontendCard => {
    return {
        id: backendCard.id,
        title: backendCard.title,
        description: backendCard.description || "",
        priority: backendCard.priority as any,
        tags: stringToTags(backendCard.tags),
        date: formatDateForFrontend(backendCard.date),
        assignees: stringToAssignees(backendCard.assignees),
        column: backendCard.column,
        order: backendCard.order,
    };
};

export const transformCardUpdatesToBackend = (
    updates: Partial<FrontendCard>,
): UpdateCardRequest => {
    const backendUpdates: UpdateCardRequest = {};

    if (updates.title !== undefined) backendUpdates.title = updates.title;
    if (updates.description !== undefined) backendUpdates.description = updates.description;
    if (updates.priority !== undefined) backendUpdates.priority = updates.priority;
    if (updates.tags !== undefined) backendUpdates.tags = tagsToString(updates.tags);
    if (updates.assignees !== undefined)
        backendUpdates.assignees = assigneesToString(updates.assignees);
    if (updates.column !== undefined) backendUpdates.column = updates.column;
    if (updates.order !== undefined) backendUpdates.order = updates.order;

    return backendUpdates;
};

export const transformColumnToBackend = (frontendColumn: Partial<FrontendColumn>) => {
    return {
        id: frontendColumn.id || crypto.randomUUID(),
        title: mapTitleToBackend(frontendColumn.title || "Todo"),
        order: frontendColumn.order ?? 0,
    };
};

export const transformColumnToFrontend = (
    backendColumn: BackendColumn,
    includeCards: boolean = true,
): FrontendColumn => {
    return {
        id: backendColumn.id,
        title: mapTitleToFrontend(backendColumn.title) as any,
        order: backendColumn.order,
        cards:
            includeCards && backendColumn.cards
                ? backendColumn.cards.map(transformCardToFrontend)
                : [],
    };
};

export const transformColumnsToFrontend = (
    backendColumn: BackendColumn,
    includeCards: boolean = true,
): FrontendColumn => {
    return {
        id: mapColumnIdToFrontend(backendColumn.id),
        title: mapTitleToFrontend(backendColumn.title) as ColumnTitle,
        order: backendColumn.order,
        cards: includeCards && backendColumn.cards
            ? backendColumn.cards.map(transformCardToFrontend)
            : [],
    };
};

export const transformColumnsToBackend = (frontendColumns: FrontendColumn[]): any[] => {
    return frontendColumns.map((column) => transformColumnToBackend(column));
};

export const createEmptyCard = (columnId: string, order: number = 0): FrontendCard => {
    return {
        id: crypto.randomUUID(),
        title: "",
        description: "",
        priority: "medium",
        tags: [],
        date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
        assignees: [],
        column: columnId,
        order,
    };
};

export const createEmptyColumn = (title: string, order: number = 0): FrontendColumn => {
    return {
        id: crypto.randomUUID(),
        title: title as any,
        order,
        cards: [],
    };
};

export const validateCardForBackend = (card: Partial<FrontendCard>): boolean => {
    if (!card.title || card.title.trim() === "") {
        console.error("Card validation failed: title is required");
        return false;
    }

    if (!card.priority || !["low", "medium", "high"].includes(card.priority)) {
        console.error("Card validation failed: invalid priority");
        return false;
    }

    return true;
};

export const cloneCard = (card: FrontendCard): FrontendCard => {
    return {
        ...card,
        tags: [...card.tags],
        assignees: card.assignees.map((a) => ({ ...a })),
    };
};

export const cloneColumn = (column: FrontendColumn): FrontendColumn => {
    return {
        ...column,
        cards: column.cards?.map((card) => cloneCard(card)) || [],
    };
};

export const mapColumnIdToBackend = (frontendId: string): string => {
    const mapping: Record<string, string> = {
        todo: "toDo",
        in_progress: "inProgress",
        completed: "done",
    };
    return mapping[frontendId] || frontendId;
};

export const mapColumnIdToFrontend = (backendId: string): string => {
    const mapping: Record<string, string> = {
        toDo: "todo",
        inProgress: "in_progress",
        done: "completed",
    };
    return mapping[backendId] || backendId;
};
