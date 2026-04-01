import { useState } from "react";

import { BOARD } from "@/components/kanban/boardData";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import type { Assignee, Card, Column, NewCardInput, Tone } from "@/components/kanban/types";

const TONES: Tone[] = ["slate", "emerald", "violet", "amber", "rose"];

function formatToday() {
    return new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

function toAssignees(names: string[]): Assignee[] {
    return names.map((name, index) => ({
        id: `u-${crypto.randomUUID()}`,
        name,
        tone: TONES[index % TONES.length],
    }));
}

function App() {
    const [columns, setColumns] = useState<Column[]>(BOARD);
    const columnIds = columns.map((column) => column.id);

    function addCard(columnId: string, input: NewCardInput) {
        const nextCard: Card = {
            id: `c-${crypto.randomUUID()}`,
            title: input.title,
            description: input.description,
            priority: input.priority,
            tags: input.tags,
            date: formatToday(),
            assignees: toAssignees(input.assigneeNames),
        };

        setColumns((current) =>
            current.map((column) =>
                column.id === columnId ? { ...column, cards: [...column.cards, nextCard] } : column,
            ),
        );
    }

    function deleteCard(columnId: string, cardId: string) {
        setColumns((current) =>
            current.map((column) =>
                column.id === columnId
                    ? { ...column, cards: column.cards.filter((card) => card.id !== cardId) }
                    : column,
            ),
        );
    }

    function editCard(columnId: string, cardId: string, input: NewCardInput) {
        setColumns((current) =>
            current.map((column) =>
                column.id !== columnId
                    ? column
                    : {
                          ...column,
                          cards: column.cards.map((card) =>
                              card.id !== cardId
                                  ? card
                                  : {
                                        ...card,
                                        title: input.title,
                                        description: input.description,
                                        priority: input.priority,
                                        tags: input.tags,
                                        assignees: toAssignees(input.assigneeNames),
                                    },
                          ),
                      },
            ),
        );
    }

    function moveCard(cardId: string, fromColumnId: string, toColumnId: string) {
        if (fromColumnId === toColumnId) return;

        setColumns((current) => {
            const sourceColumn = current.find((column) => column.id === fromColumnId);
            const cardToMove = sourceColumn?.cards.find((card) => card.id === cardId);
            if (!cardToMove) return current;

            return current.map((column) => {
                if (column.id === fromColumnId) {
                    return {
                        ...column,
                        cards: column.cards.filter((card) => card.id !== cardId),
                    };
                }

                if (column.id === toColumnId) {
                    return {
                        ...column,
                        cards: [...column.cards, cardToMove],
                    };
                }

                return column;
            });
        });
    }

    return (
        <main className="min-h-dvh bg-background">
            <div className="container mx-auto space-y-6 px-4 py-10">
                <header className="flex items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Kanban Board</h1>
                    </div>
                </header>

                <section className="grid gap-6 md:grid-cols-3" aria-label="Kanban board">
                    {columns.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            columnIds={columnIds}
                            onAddCard={addCard}
                            onDeleteCard={deleteCard}
                            onEditCard={editCard}
                            onMoveCard={moveCard}
                        />
                    ))}
                </section>
            </div>
        </main>
    );
}

export default App;
