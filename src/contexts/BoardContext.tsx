import React, { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { loadBoardData, refreshBoardData } from "@/services/dataLoader";
import type { Column, Card, NewCardInput } from "@/types/kanban";
import { getTodayFormatted } from "@/utils/dateHelpers";
import { namesToAssignees } from "@/utils/transformers";
import { createCard, removeCard, updateCard } from "@/services/api";

export interface BoardContextType {
    columns: Column[];
    loading: boolean;
    error: string | null;
    refreshBoard: () => Promise<void>;
    addCard: (columnId: string, input: NewCardInput) => Promise<void>;
    deleteCard: (columnId: string, cardId: string) => Promise<void>;
    saveCardEdit: (
        fromColumnId: string,
        cardId: string,
        targetColumnId: string,
        input: NewCardInput,
    ) => Promise<void>;
    moveCard: (
        cardId: string,
        fromColumnId: string,
        toColumnId: string,
        newOrder?: number,
    ) => Promise<void>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

const getNextCardOrder = (column: Column | undefined): number => {
    return column?.cards?.length ?? 0;
};

const sortCardsByOrder = (cards: Card[]): Card[] =>
    [...cards].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const withSequentialOrder = (cards: Card[]): Card[] =>
    cards.map((card, index) => ({
        ...card,
        order: index,
    }));

const replaceCardInColumns = (columns: Column[], cardId: string, saved: Card): Column[] => {
    const without = columns.map((col) => ({
        ...col,
        cards: (col.cards ?? []).filter((c) => c.id !== cardId),
    }));
    const destId = saved.column;
    if (!destId) {
        return without;
    }
    return without.map((col) =>
        col.id === destId
            ? { ...col, cards: sortCardsByOrder([...(col.cards ?? []), saved]) }
            : col,
    );
};

const withNormalizedColumnOrders = (columns: Column[]): Column[] =>
    columns.map((column: Column) => ({
        ...column,
        cards: withSequentialOrder(sortCardsByOrder(column.cards ?? [])),
    }));

export const BoardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async (): Promise<void> => {
        try {
            setLoading(true);
            const data = await loadBoardData();
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
        try {
            setLoading(true);
            const data = await refreshBoardData();
            setColumns(data);
            setError(null);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to refresh board data";
            setError(errorMessage);
            console.error("Error refreshing board data:", err);
        } finally {
            setLoading(false);
        }
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

        try {
            const savedCard = await createCard(columnId, newCard);

            setColumns((current: Column[]) =>
                current.map((column: Column) =>
                    column.id === columnId
                        ? {
                              ...column,
                              cards: (column.cards ?? []).map((card) =>
                                  card.id === newCard.id ? savedCard : card,
                              ),
                          }
                        : column,
                ),
            );
        } catch (error) {
            console.error("Failed to save card:", error);
            setColumns((current: Column[]) =>
                current.map((column: Column) =>
                    column.id === columnId
                        ? {
                              ...column,
                              cards: (column.cards ?? []).filter((card) => card.id !== newCard.id),
                          }
                        : column,
                ),
            );
        }
    };

    const deleteCard = async (columnId: string, cardId: string): Promise<void> => {
        let snapshot: Column[] | null = null;
        setColumns((current: Column[]) => {
            snapshot = current.map((col: Column) => ({
                ...col,
                cards: (col.cards ?? []).map((c: Card) => ({ ...c })),
            }));
            return current.map((column: Column) =>
                column.id === columnId
                    ? {
                          ...column,
                          cards: (column.cards ?? []).filter((card: Card) => card.id !== cardId),
                      }
                    : column,
            );
        });

        try {
            await removeCard(cardId);
        } catch (error) {
            console.error("Failed to delete card:", error);
            if (snapshot) {
                setColumns(snapshot);
            }
        }
    };

    const saveCardEdit = async (
        fromColumnId: string,
        cardId: string,
        targetColumnId: string,
        input: NewCardInput,
    ): Promise<void> => {
        let orderForApi = 0;
        let snapshot: Column[] | null = null;

        setColumns((current: Column[]) => {
            snapshot = current.map((col: Column) => ({
                ...col,
                cards: (col.cards ?? []).map((c: Card) => ({ ...c })),
            }));

            const sourceColumn = current.find((c: Column) => c.id === fromColumnId);
            const existing = sourceColumn?.cards?.find((c: Card) => c.id === cardId);
            if (!existing) {
                return current;
            }

            const targetColumn = current.find((c: Column) => c.id === targetColumnId);
            orderForApi =
                fromColumnId === targetColumnId
                    ? (existing.order ?? 0)
                    : (targetColumn?.cards ?? []).filter((c: Card) => c.id !== cardId).length;

            const merged: Card = {
                ...existing,
                title: input.title,
                description: input.description ?? "",
                priority: input.priority,
                tags: input.tags,
                assignees: namesToAssignees(input.assigneeNames),
                column: targetColumnId,
                order: orderForApi,
            };

            if (fromColumnId === targetColumnId) {
                return current.map((column: Column) =>
                    column.id !== fromColumnId
                        ? column
                        : {
                              ...column,
                              cards: (column.cards ?? []).map((card: Card) =>
                                  card.id === cardId ? merged : card,
                              ),
                          },
                );
            }

            return current.map((column: Column) => {
                if (column.id === fromColumnId) {
                    return {
                        ...column,
                        cards: (column.cards ?? []).filter((card: Card) => card.id !== cardId),
                    };
                }
                if (column.id === targetColumnId) {
                    return {
                        ...column,
                        cards: [...(column.cards ?? []), merged],
                    };
                }
                return column;
            });
        });

        try {
            const saved = await updateCard(cardId, {
                title: input.title,
                description: input.description ?? "",
                priority: input.priority,
                tags: input.tags,
                assignees: namesToAssignees(input.assigneeNames),
                column: targetColumnId,
                order: orderForApi,
            });
            const merged: Card = { ...saved, column: saved.column ?? targetColumnId };
            setColumns((current: Column[]) => replaceCardInColumns(current, cardId, merged));
        } catch (error) {
            console.error("Failed to save card:", error);
            if (snapshot) {
                setColumns(snapshot);
            }
        }
    };

    const moveCard = async (
        cardId: string,
        fromColumnId: string,
        toColumnId: string,
        newOrder?: number,
    ): Promise<void> => {
        let orderForApi = 0;
        let movedCardSnapshot: Card | null = null;
        let nextColumnsForApi: Column[] = [];
        let snapshot: Column[] | null = null;

        setColumns((current: Column[]) => {
            snapshot = current.map((col: Column) => ({
                ...col,
                cards: (col.cards ?? []).map((c: Card) => ({ ...c })),
            }));

            const sourceColumn = current.find((column: Column) => column.id === fromColumnId);
            const cardToMove = sourceColumn?.cards?.find((card: Card) => card.id === cardId);
            if (!cardToMove) {
                return current;
            }

            const targetColumn = current.find((c: Column) => c.id === toColumnId);
            const sourceCardsWithoutActive = (sourceColumn?.cards ?? []).filter(
                (card: Card) => card.id !== cardId,
            );

            const targetCardsBase =
                fromColumnId === toColumnId
                    ? sourceCardsWithoutActive
                    : [...(targetColumn?.cards ?? [])];
            const nextOrder = Math.max(
                0,
                Math.min(newOrder ?? targetCardsBase.length, targetCardsBase.length),
            );
            orderForApi = nextOrder;

            const updatedCard: Card = {
                ...cardToMove,
                column: toColumnId,
                order: orderForApi,
            };
            movedCardSnapshot = updatedCard;

            const updatedTargetCards = withSequentialOrder([
                ...targetCardsBase.slice(0, nextOrder),
                updatedCard,
                ...targetCardsBase.slice(nextOrder),
            ]);

            const nextColumns = current.map((column: Column) => {
                if (column.id === fromColumnId) {
                    if (fromColumnId === toColumnId) {
                        return {
                            ...column,
                            cards: updatedTargetCards,
                        };
                    }
                    return {
                        ...column,
                        cards: (column.cards ?? []).filter((card: Card) => card.id !== cardId),
                    };
                }
                if (column.id === toColumnId) {
                    return {
                        ...column,
                        cards: updatedTargetCards,
                    };
                }
                return column;
            });
            nextColumnsForApi = withNormalizedColumnOrders(nextColumns);
            return nextColumnsForApi;
        });

        try {
            if (!movedCardSnapshot) {
                return;
            }

            await updateCard(cardId, {
                column: toColumnId,
                order: orderForApi,
            });

            const columnsToPersist = [fromColumnId, toColumnId];
            const updates = nextColumnsForApi
                .filter((column) => columnsToPersist.includes(column.id))
                .flatMap((column) =>
                    (column.cards ?? []).map((card, index) =>
                        updateCard(card.id, {
                            column: column.id,
                            order: index,
                        }),
                    ),
                );

            if (updates.length > 0) {
                await Promise.all(updates);
            }

            setColumns((current: Column[]) => withNormalizedColumnOrders(current));
        } catch (error) {
            console.error("Failed to move card:", error);
            if (snapshot) {
                setColumns(snapshot);
            }
        }
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
                saveCardEdit,
                moveCard,
            }}
        >
            {children}
        </BoardContext.Provider>
    );
};

export { BoardContext };
