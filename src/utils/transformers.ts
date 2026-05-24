import type {
    Card as FrontendCard,
    Column as FrontendColumn,
    BackendCard,
    BackendColumn,
    CreateCardRequest,
    UpdateCardRequest,
    Assignee,
    Priority,
    Tone,
    ColumnTitle,
} from "../types/kanban.ts";

type DateFormatOptions = {
    month: "short" | "numeric" | "2-digit";
    day: "numeric" | "2-digit";
    year: "numeric" | "2-digit";
};

const TONES: readonly Tone[] = ["slate", "emerald", "violet", "amber", "rose"] as const;

const DATE_FORMAT_OPTIONS: DateFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
} as const;

const isValidDate = (date: Date): boolean => {
    return !isNaN(date.getTime());
};

const isValidDateFormat = (dateString: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
};

const calculateHashFromName = (name: string): number => {
    return name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
};

const getToneFromName = (name: string): Tone => {
    const hash = calculateHashFromName(name);
    const toneIndex = hash % TONES.length;
    return TONES[toneIndex];
};

const generateAssigneeId = (name: string, index: number): string => {
    return `assignee-${name.toLowerCase().replace(/\s/g, "-")}-${index}`;
};

export const formatDateForBackend = (frontendDate: string): string => {
    if (!frontendDate) {
        return new Date().toISOString().split("T")[0] ?? "";
    }

    try {
        if (isValidDateFormat(frontendDate)) {
            return frontendDate;
        }

        const date = new Date(frontendDate);

        if (!isValidDate(date)) {
            console.warn("Invalid date:", frontendDate);
            return new Date().toISOString().split("T")[0] ?? "";
        }

        return date.toISOString().split("T")[0] ?? "";
    } catch (error) {
        console.error("Date parsing error:", error);
        return new Date().toISOString().split("T")[0] ?? "";
    }
};

export const formatDateForFrontend = (backendDate: string): string => {
    if (!backendDate) return "";

    try {
        const date = new Date(backendDate);

        if (!isValidDate(date)) {
            return backendDate;
        }

        return date.toLocaleDateString("en-US", DATE_FORMAT_OPTIONS);
    } catch (error) {
        console.error("Date formatting error:", error);
        return backendDate;
    }
};

export const tagsToString = (tags: string[] | string): string => {
    if (!tags) return "";

    if (Array.isArray(tags)) {
        const filteredTags = tags.filter((tag) => tag && tag.trim().length > 0);
        return filteredTags.join(",");
    }

    return tags;
};

export const stringToTags = (tagsString: string): string[] => {
    if (!tagsString || typeof tagsString !== "string") {
        return [];
    }

    return tagsString
        .split(",")
        .filter((tag) => tag && tag.trim().length > 0)
        .map((tag) => tag.trim());
};

export const assigneesToString = (assignees: Assignee[] | string): string => {
    if (!assignees) return "";

    if (Array.isArray(assignees)) {
        const names = assignees.map((assignee: Assignee) => assignee.name);
        return names.join(", ");
    }

    return assignees;
};

export const stringToAssignees = (assigneesString: string): Assignee[] => {
    if (!assigneesString || typeof assigneesString !== "string") {
        return [];
    }

    const names = assigneesString
        .split(",")
        .filter((name) => name && name.trim().length > 0)
        .map((name) => name.trim());

    return names.map(
        (name: string, index: number): Assignee => ({
            id: generateAssigneeId(name, index),
            name: name,
            tone: getToneFromName(name),
        }),
    );
};

export const namesToAssignees = (names: string[]): Assignee[] => {
    if (!names || !Array.isArray(names)) {
        return [];
    }
    const validNames = names.filter(
        (name): boolean => typeof name === "string" && name.trim().length > 0,
    );

    return validNames.map(
        (name: string, index: number): Assignee => ({
            id: generateAssigneeId(name, index),
            name: name.trim(),
            tone: getToneFromName(name.trim()),
        }),
    );
};

export const mapTitleToBackend = (frontendTitle: ColumnTitle | string): string => {
    return frontendTitle;
};

export const mapTitleToFrontend = (backendTitle: string): ColumnTitle => {
    return backendTitle as ColumnTitle;
};

export const mapColumnIdToBackend = (frontendId: string): string => {
    return frontendId;
};

export const mapColumnIdToFrontend = (backendId: string): string => {
    return backendId;
};

export const transformCardToBackend = (
    frontendCard: Partial<FrontendCard>,
    columnId: string,
): CreateCardRequest => {
    const backendColumnId = mapColumnIdToBackend(columnId);

    console.log(
        `📤 Transforming card: frontend column "${columnId}" -> backend column "${backendColumnId}"`,
    );

    return {
        id: frontendCard.id ?? crypto.randomUUID(),
        title: frontendCard.title ?? "Untitled",
        description: frontendCard.description ?? "",
        priority: frontendCard.priority ?? "medium",
        tags: tagsToString(frontendCard.tags ?? []),
        date: formatDateForBackend(frontendCard.date ?? new Date().toISOString()),
        assignees: assigneesToString(frontendCard.assignees ?? []),
        column: backendColumnId,
        order: frontendCard.order ?? 0,
    };
};

export const transformCardToFrontend = (backendCard: BackendCard): FrontendCard => {
    if (!backendCard) {
        console.warn("No backend card provided to transformer");
        return {
            id: "",
            title: "",
            description: "",
            priority: "medium",
            tags: [],
            date: "",
            assignees: [],
            column: "",
            order: 0,
        };
    }

    const isValidPriority = (priority: string): priority is Priority => {
        return ["low", "medium", "high"].includes(priority);
    };

    const priority: Priority = isValidPriority(backendCard.priority)
        ? backendCard.priority
        : "medium";

    return {
        id: backendCard.id,
        title: backendCard.title,
        description: backendCard.description ?? "",
        priority: priority,
        tags: stringToTags(backendCard.tags),
        date: formatDateForFrontend(backendCard.date),
        assignees: stringToAssignees(backendCard.assignees),
        column: mapColumnIdToFrontend(backendCard.column),
        order: backendCard.order,
    };
};

export const transformCardUpdatesToBackend = (
    updates: Partial<FrontendCard>,
): UpdateCardRequest => {
    const backendUpdates: UpdateCardRequest = {};

    if (updates.title !== undefined) {
        backendUpdates.title = updates.title;
    }

    if (updates.description !== undefined) {
        backendUpdates.description = updates.description;
    }

    if (updates.priority !== undefined) {
        backendUpdates.priority = updates.priority;
    }

    if (updates.tags !== undefined) {
        backendUpdates.tags = tagsToString(updates.tags);
    }

    if (updates.assignees !== undefined) {
        backendUpdates.assignees = assigneesToString(updates.assignees);
    }

    if (updates.column !== undefined) {
        backendUpdates.column = mapColumnIdToBackend(updates.column);
    }

    if (updates.order !== undefined) {
        backendUpdates.order = updates.order;
    }

    return backendUpdates;
};

export const transformColumnToBackend = (frontendColumn: Partial<FrontendColumn>) => {
    const columnId = frontendColumn.id ?? crypto.randomUUID();
    const columnTitle = frontendColumn.title ?? "New Column";

    return {
        id: mapColumnIdToBackend(columnId),
        title: mapTitleToBackend(columnTitle),
        order: frontendColumn.order ?? 0,
    };
};

export const transformColumnToFrontend = (
    backendColumn: BackendColumn,
    includeCards: boolean = true,
): FrontendColumn => {
    if (!backendColumn) {
        console.warn("No backend column provided to transformer");
        return {
            id: "",
            title: "New Column",
            order: 0,
            cards: [],
        };
    }

    let transformedCards: FrontendCard[] = [];

    if (includeCards && backendColumn.cards && Array.isArray(backendColumn.cards)) {
        transformedCards = backendColumn.cards.map((card: BackendCard) =>
            transformCardToFrontend(card),
        );
        transformedCards.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    return {
        id: mapColumnIdToFrontend(backendColumn.id),
        title: mapTitleToFrontend(backendColumn.title),
        order: backendColumn.order,
        cards: transformedCards,
    };
};

export const transformColumnsToFrontend = (backendColumns: BackendColumn[]): FrontendColumn[] => {
    if (!backendColumns || !Array.isArray(backendColumns)) {
        console.warn("Invalid backendColumns provided to transformColumnsToFrontend");
        return [];
    }

    return backendColumns.map((column: BackendColumn) => transformColumnToFrontend(column, true));
};

export const transformColumnsToBackend = (
    frontendColumns: FrontendColumn[],
): ReturnType<typeof transformColumnToBackend>[] => {
    if (!frontendColumns || !Array.isArray(frontendColumns)) {
        return [];
    }

    return frontendColumns.map((column: FrontendColumn) => transformColumnToBackend(column));
};


export const isBackendCard = (value: unknown): value is BackendCard => {
    return (
        typeof value === "object" &&
        value !== null &&
        "id" in value &&
        "title" in value &&
        "priority" in value
    );
};

export const isBackendColumn = (value: unknown): value is BackendColumn => {
    return (
        typeof value === "object" &&
        value !== null &&
        "id" in value &&
        "title" in value &&
        "order" in value
    );
};
