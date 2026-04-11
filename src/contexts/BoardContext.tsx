import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { loadBoardData } from "@/services/dataLoader";
import type { Column, Card, NewCardInput } from "@/types/kanban";

interface BoardContextType {
    columns: Column[];
    loading: boolean;
    error: string | null;
    refreshBoard: () => Promise<void>;
    addCard: (columnId: string, input: NewCardInput) => Promise<void>;
    deleteCard: (columnId: string, cardId: string) => void;
    editCard: (columnId: string, cardId: string, input: NewCardInput) => void;
    moveCard: (cardId: string, fromColumnId: string, toColumnId: string, newOrder?: number) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) {
        throw new Error("useBoard must be used within BoardProvider");
    }
    return context;
};

const TONES: string[] = ["slate", "emerald", "violet", "amber", "rose"];

function formatToday() {
    return new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

function toAssignees(names: string[]): any[] {
    return names.map((name, index) => ({
        id: `u-${crypto.randomUUID()}`,
        name,
        tone: TONES[index % TONES.length],
    }));
}

export const BoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const loadData = async () => {
        try {
            setLoading(true);
            const data = await loadBoardData();
            console.log(data);
            setColumns(data);
            setError(null);
        } catch (err) {
            setError("Failed to load board data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadData();
    }, []);

    const refreshBoard = async () => {
        await loadData();
    };

    const addCard = async (columnId: string, input: NewCardInput) => {
        const newCard: Card = {
            id: `c-${crypto.randomUUID()}`,
            title: input.title,
            description: input.description || "",
            priority: input.priority,
            tags: input.tags,
            date: formatToday(),
            assignees: toAssignees(input.assigneeNames),
            column: columnId,
            order: columns.find((col) => col.id === columnId)?.cards?.length || 0,
        };

        setColumns((current) =>
            current.map((column) =>
                column.id === columnId
                    ? { ...column, cards: [...(column.cards || []), newCard] }
                    : column,
            ),
        );

        // TODO: Call API to save to backend
        // await createCard(columnId, newCard);
    };

    const deleteCard = (columnId: string, cardId: string) => {
        setColumns((current) =>
            current.map((column) =>
                column.id === columnId
                    ? {
                          ...column,
                          cards: (column.cards || []).filter((card) => card.id !== cardId),
                      }
                    : column,
            ),
        );
    };

    const editCard = (columnId: string, cardId: string, input: NewCardInput) => {
        setColumns((current) =>
            current.map((column) =>
                column.id !== columnId
                    ? column
                    : {
                          ...column,
                          cards: (column.cards || []).map((card) =>
                              card.id !== cardId
                                  ? card
                                  : {
                                        ...card,
                                        title: input.title,
                                        description: input.description || "",
                                        priority: input.priority,
                                        tags: input.tags,
                                        assignees: toAssignees(input.assigneeNames),
                                    },
                          ),
                      },
            ),
        );
    };

    const moveCard = (
        cardId: string,
        fromColumnId: string,
        toColumnId: string,
        newOrder?: number,
    ) => {
        if (fromColumnId === toColumnId) return;

        setColumns((current) => {
            const sourceColumn = current.find((column) => column.id === fromColumnId);
            const cardToMove = sourceColumn?.cards?.find((card) => card.id === cardId);
            if (!cardToMove) return current;

            const updatedCard = {
                ...cardToMove,
                column: toColumnId,
                order: newOrder ?? current.find((c) => c.id === toColumnId)?.cards?.length ?? 0,
            };

            return current.map((column) => {
                if (column.id === fromColumnId) {
                    return {
                        ...column,
                        cards: (column.cards || []).filter((card) => card.id !== cardId),
                    };
                }

                if (column.id === toColumnId) {
                    return {
                        ...column,
                        cards: [...(column.cards || []), updatedCard],
                    };
                }

                return column;
            });
        });
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <BoardContext.Provider
            value={{
                columns,
                loading,
                error,
                refreshBoard,
                addCard,
                deleteCard,
                editCard,
                moveCard,
            }}
        >
            {children}
        </BoardContext.Provider>
    );
};
