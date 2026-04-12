// contexts/BoardContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { loadBoardData } from "@/services/dataLoader";
import type { Column, Card, NewCardInput } from "@/types/kanban";
import { getTodayFormatted } from "@/utils/dateHelpers";
import { namesToAssignees } from "@/utils/transformers";

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

const getNextCardOrder = (column: Column | undefined): number => {
    return column?.cards?.length ?? 0;
};

export const BoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (): Promise<void> => {
        try {
            setLoading(true);
            const data = await loadBoardData();
            console.log("Loaded board data:", data);
            setColumns(data);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to load board data";
            setError(errorMessage);
            console.error("Error loading board data:", err);
        } finally {
            setLoading(false);
        }
    };

    const refreshBoard = async (): Promise<void> => {
        await loadData();
    };

    const addCard = async (columnId: string, input: NewCardInput): Promise<void> => {
        const targetColumn = columns.find((col) => col.id === columnId);
        const newOrder = getNextCardOrder(targetColumn);

        const newCard: Card = {
            id: `c-${crypto.randomUUID()}`,
            title: input.title,
            description: input.description ?? "",
            priority: input.priority,
            tags: input.tags,
            date: getTodayFormatted(),
            assignees: namesToAssignees(input.assigneeNames),
            column: columnId,
            order: newOrder,
        };

        setColumns((current: Column[]) =>
            current.map((column: Column) =>
                column.id === columnId
                    ? { ...column, cards: [...(column.cards ?? []), newCard] }
                    : column,
            ),
        );

        // TODO: Call API to save to backend
        // await createCard(columnId, newCard);
    };

    const deleteCard = (columnId: string, cardId: string): void => {
        setColumns((current: Column[]) =>
            current.map((column: Column) =>
                column.id === columnId
                    ? {
                          ...column,
                          cards: (column.cards ?? []).filter((card: Card) => card.id !== cardId),
                      }
                    : column,
            ),
        );
    };

    const editCard = (columnId: string, cardId: string, input: NewCardInput): void => {
        setColumns((current: Column[]) =>
            current.map((column: Column) =>
                column.id !== columnId
                    ? column
                    : {
                          ...column,
                          cards: (column.cards ?? []).map((card: Card) =>
                              card.id !== cardId
                                  ? card
                                  : {
                                        ...card,
                                        title: input.title,
                                        description: input.description ?? "",
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
    ): void => {
        if (fromColumnId === toColumnId) return;

        setColumns((current: Column[]) => {
            const sourceColumn = current.find((column: Column) => column.id === fromColumnId);
            const cardToMove = sourceColumn?.cards?.find((card: Card) => card.id === cardId);

            if (!cardToMove) return current;

            const targetColumn = current.find((c: Column) => c.id === toColumnId);
            const updatedOrder = newOrder ?? targetColumn?.cards?.length ?? 0;

            const updatedCard: Card = {
                ...cardToMove,
                column: toColumnId,
                order: updatedOrder,
            };

            return current.map((column: Column) => {
                if (column.id === fromColumnId) {
                    return {
                        ...column,
                        cards: (column.cards ?? []).filter((card: Card) => card.id !== cardId),
                    };
                }

                if (column.id === toColumnId) {
                    return {
                        ...column,
                        cards: [...(column.cards ?? []), updatedCard],
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
