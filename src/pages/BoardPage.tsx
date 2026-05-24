import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useBoard } from "@/contexts/useBoard";
import { useError } from "@/contexts/ErrorContext";
import { handleError } from "@/lib/errorRouting";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { KanbanCard } from "@/components/kanban/KanbanCard";
import { Button } from "@/components/ui/button";
import type { Card } from "@/types/kanban";

export function BoardPage() {
    const navigate = useNavigate();
    const { notifyError } = useError();
    const {
        columns,
        loading,
        error,
        addCard: contextAddCard,
        deleteCard: contextDeleteCard,
        saveCardEdit: contextSaveCardEdit,
        moveCard: contextMoveCard,
        addColumn: contextAddColumn,
        updateColumn: contextUpdateColumn,
        deleteColumn: contextDeleteColumn,
        moveColumn: contextMoveColumn,
    } = useBoard();
    const sortedColumns = [...columns].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const columnIds = sortedColumns.map((column) => column.id);
    const [activeCard, setActiveCard] = useState<Card | null>(null);
    const [newColumnTitle, setNewColumnTitle] = useState("");
    const [showAddColumn, setShowAddColumn] = useState(false);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor),
    );

    const addCard = async (columnId: string, input: Parameters<typeof contextAddCard>[1]) => {
        try {
            await contextAddCard(columnId, input);
        } catch (err) {
            handleError(err, { navigate, notify: notifyError });
        }
    };

    const deleteCard = async (columnId: string, cardId: string) => {
        try {
            await contextDeleteCard(columnId, cardId);
        } catch (err) {
            handleError(err, { navigate, notify: notifyError });
        }
    };

    const saveCardEdit = async (
        fromColumnId: string,
        cardId: string,
        targetColumnId: string,
        input: Parameters<typeof contextSaveCardEdit>[3],
    ) => {
        try {
            await contextSaveCardEdit(fromColumnId, cardId, targetColumnId, input);
        } catch (err) {
            handleError(err, { navigate, notify: notifyError });
        }
    };

    const moveCard = async (
        cardId: string,
        fromColumnId: string,
        toColumnId: string,
        newOrder?: number,
    ) => {
        try {
            await contextMoveCard(cardId, fromColumnId, toColumnId, newOrder);
        } catch (err) {
            handleError(err, { navigate, notify: notifyError });
        }
    };

    const addColumn = async (title: string) => {
        try {
            await contextAddColumn(title);
        } catch (err) {
            handleError(err, { navigate, notify: notifyError });
        }
    };

    const updateColumn = async (columnId: string, title: string) => {
        try {
            await contextUpdateColumn(columnId, title);
        } catch (err) {
            handleError(err, { navigate, notify: notifyError });
        }
    };

    const deleteColumn = async (columnId: string) => {
        try {
            await contextDeleteColumn(columnId);
        } catch (err) {
            handleError(err, { navigate, notify: notifyError });
        }
    };

    const moveColumn = async (columnId: string, direction: -1 | 1) => {
        try {
            await contextMoveColumn(columnId, direction);
        } catch (err) {
            handleError(err, { navigate, notify: notifyError });
        }
    };

    const findCardColumn = (cardId: string) => {
        for (const column of columns) {
            if (column.cards?.some((card) => card.id === cardId)) {
                return column.id;
            }
        }
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const id = String(event.active.id);

        for (const column of columns) {
            const card = column.cards?.find((card) => card.id === id);
            if (card) {
                setActiveCard(card);
                break;
            }
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        const activeId = String(active.id);
        const overId = String(over?.id ?? "");

        setActiveCard(null);
        if (!over) return;

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
            destinationIndex =
                destinationColumn?.cards?.findIndex((card) => card.id === overId) ?? 0;
            if (destinationIndex < 0) {
                destinationIndex = destinationColumn?.cards?.length ?? 0;
            }
        }

        if (activeColumnId === overColumnId && activeId === overId) return;

        await moveCard(activeId, activeColumnId, overColumnId, destinationIndex);
    };

    const handleAddColumn = async () => {
        if (newColumnTitle.trim()) {
            await addColumn(newColumnTitle.trim());
            setNewColumnTitle("");
            setShowAddColumn(false);
        }
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
                    <div className="flex items-center gap-2">
                        {showAddColumn ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Column title"
                                    value={newColumnTitle}
                                    onChange={(e) => setNewColumnTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAddColumn();
                                        if (e.key === "Escape") setShowAddColumn(false);
                                    }}
                                    className="w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
                                    autoFocus
                                />
                                <Button size="sm" onClick={handleAddColumn}>
                                    Add
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAddColumn(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => setShowAddColumn(true)}>Add Column</Button>
                        )}
                    </div>
                </header>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <section
                        className={`grid gap-6 ${sortedColumns.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-4 lg:grid-cols-5"}`}
                        aria-label="Kanban board"
                    >
                        {sortedColumns.map((column, index) => (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                columns={sortedColumns}
                                onAddCard={addCard}
                                onDeleteCard={deleteCard}
                                onSaveCardEdit={saveCardEdit}
                                onUpdateColumn={updateColumn}
                                onDeleteColumn={deleteColumn}
                                onMoveLeft={() => moveColumn(column.id, -1)}
                                onMoveRight={() => moveColumn(column.id, 1)}
                                isFirst={index === 0}
                                isLast={index === sortedColumns.length - 1}
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
