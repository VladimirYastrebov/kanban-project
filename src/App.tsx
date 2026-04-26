import { useBoard } from "./contexts/useBoard.ts";
import { KanbanColumn } from "@/components/kanban/KanbanColumn.tsx";
import { KanbanCard } from "@/components/kanban/KanbanCard.tsx";
import { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    type DragEndEvent,
    type DragStartEvent,
} from "@dnd-kit/core";
import type { Card } from "./types/kanban.ts";

function App() {
    const { columns, loading, error, addCard, deleteCard, saveCardEdit, moveCard } = useBoard();
    const columnIds = columns.map((column) => column.id);
    const [activeCard, setActiveCard] = useState<Card | null>(null);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor),
    );

    const findCardColumn = (cardId: string) => {
        for (const column of columns) {
            const columnId = column.id;
            if (column.cards?.some((card: Card) => card.id === cardId)) {
                return columnId;
            }
        }
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const cardId = String(active.id);
        for (const column of columns) {
            const card = column.cards?.find((card: Card) => card.id === cardId);
            if (card) {
                setActiveCard(card);
                break;
            }
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCard(null);

        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        const activeColumnId = findCardColumn(activeId);
        if (!activeColumnId) return;

        const overColumnId = columnIds.includes(overId) ? overId : findCardColumn(overId);
        if (!overColumnId) return;

        const sourceColumn = columns.find((column) => column.id === activeColumnId);
        if (!sourceColumn) return;

        const sourceCards = sourceColumn.cards ?? [];
        const activeIndex = sourceCards.findIndex((card) => card.id === activeId);
        if (activeIndex === -1) return;

        let destinationIndex = 0;
        if (columnIds.includes(overId)) {
            const destinationColumn = columns.find((column) => column.id === overColumnId);
            destinationIndex = destinationColumn?.cards?.length ?? 0;
        } else {
            const destinationColumn = columns.find((column) => column.id === overColumnId);
            destinationIndex = destinationColumn?.cards?.findIndex((card) => card.id === overId) ?? 0;
            if (destinationIndex < 0) {
                destinationIndex = destinationColumn?.cards?.length ?? 0;
            }
        }

        if (activeColumnId === overColumnId && activeId === overId) return;

        await moveCard(activeId, activeColumnId, overColumnId, destinationIndex);
    };

    if (loading) {
        return (
            <main className="min-h-dvh bg-background">
                <div className="container mx-auto px-4 py-10">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-lg">Loading your kanban board...</div>
                    </div>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-dvh bg-background">
                <div className="container mx-auto px-4 py-10">
                    <div className="text-red-500 text-center p-10">{error}</div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-dvh bg-background">
            <div className="container mx-auto space-y-6 px-4 py-10">
                <header className="flex items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Kanban Board</h1>
                        <p className="text-sm text-muted-foreground">
                            {columns.length} columns •{" "}
                            {columns.reduce((acc, col) => acc + (col.cards?.length || 0), 0)} cards
                        </p>
                    </div>
                </header>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <section className="grid gap-6 md:grid-cols-3" aria-label="Kanban board">
                        {columns.map((column) => (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                columnIds={columnIds}
                                onAddCard={addCard}
                                onDeleteCard={deleteCard}
                                onSaveCardEdit={saveCardEdit}
                            />
                        ))}
                    </section>

                    <DragOverlay>
                        {activeCard ? <KanbanCard card={activeCard} /> : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </main>
    );
}

export default App;
