import { useState } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { SortableTask } from "../dnd/SortableTask";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { KanbanCard } from "./KanbanCard";
import type { Card as CardType, Column, NewCardInput, Priority, Tag } from "../../types/kanban";

const KNOWN_TAGS = ["Web", "Mobile", "Design"] as const satisfies readonly Tag[];

const normalizeTags = (tags: string[]): Tag[] =>
    tags.filter((t): t is Tag => (KNOWN_TAGS as readonly string[]).includes(t));

type KanbanColumnProps = {
    column: Column;
    columns: Column[];
    onAddCard: (columnId: string, input: NewCardInput) => void | Promise<void>;
    onDeleteCard: (columnId: string, cardId: string) => void | Promise<void>;
    onSaveCardEdit: (
        fromColumnId: string,
        cardId: string,
        targetColumnId: string,
        input: NewCardInput,
    ) => void | Promise<void>;
    onUpdateColumn?: (columnId: string, title: string) => void | Promise<void>;
    onDeleteColumn?: (columnId: string) => void | Promise<void>;
    onMoveLeft?: () => void;
    onMoveRight?: () => void;
    isFirst?: boolean;
    isLast?: boolean;
};

export function KanbanColumn({
    column,
    columns,
    onAddCard,
    onDeleteCard,
    onSaveCardEdit,
    onUpdateColumn,
    onDeleteColumn,
    onMoveLeft,
    onMoveRight,
    isFirst = false,
    isLast = false,
}: KanbanColumnProps) {
    const { setNodeRef: setDroppableRef } = useDroppable({
        id: column.id,
    });
    const [isOpen, setIsOpen] = useState(false);
    const [selectedColumnId, setSelectedColumnId] = useState(column.id);
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<Priority>("low");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<Tag[]>([]);
    const [assignees, setAssignees] = useState("");
    const [editingCard, setEditingCard] = useState<CardType | null>(null);
    const [editingColumnTitle, setEditingColumnTitle] = useState(false);
    const [columnTitle, setColumnTitle] = useState(column.title);


    function resetForm() {
        setSelectedColumnId(column.id);
        setTitle("");
        setPriority("low");
        setDescription("");
        setTags([]);
        setAssignees("");
        setEditingCard(null);
    }

    function openAddModal() {
        resetForm();
        setIsOpen(true);
    }

    function openEditModal(card: CardType) {
        setEditingCard(card);
        setSelectedColumnId(column.id);
        setTitle(card.title);
        setPriority(card.priority);
        setDescription(card.description ?? "");
        setTags(normalizeTags(card.tags ?? []));
        setAssignees(card.assignees.map((assignee) => assignee.name).join(", "));
        setIsOpen(true);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const parsedAssignees = assignees
            .split(",")
            .map((name) => name.trim())
            .filter(Boolean);

        const input: NewCardInput = {
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            tags,
            assigneeNames: parsedAssignees,
        };

        if (editingCard) {
            await onSaveCardEdit(column.id, editingCard.id, selectedColumnId, input);
        } else {
            await onAddCard(selectedColumnId, input);
        }

        setIsOpen(false);
        resetForm();
    }

    const handleColumnTitleEdit = () => {
        setEditingColumnTitle(true);
        setColumnTitle(column.title);
    };

    const handleColumnTitleSave = async () => {
        if (columnTitle.trim() && columnTitle !== column.title && onUpdateColumn) {
            await onUpdateColumn(column.id, columnTitle.trim());
        }
        setEditingColumnTitle(false);
    };

    const handleColumnTitleCancel = () => {
        setColumnTitle(column.title);
        setEditingColumnTitle(false);
    };

    const handleColumnDelete = async () => {
        if (onDeleteColumn && window.confirm(`Delete column "${column.title}"?`)) {
            await onDeleteColumn(column.id);
        }
    };

    const cards = column.cards ?? [];
    const taskIds = cards.map((card) => card.id);
    return (
        <>
            <Card
                aria-label={`${column.title} column`}
                className="bg-muted/20"
            >
                <CardHeader className="flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2 flex-1">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Move column left"
                                onClick={onMoveLeft}
                                disabled={isFirst}
                            >
                                ←
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Move column right"
                                onClick={onMoveRight}
                                disabled={isLast}
                            >
                                →
                            </Button>
                        </div>
                        {editingColumnTitle ? (
                            <div className="flex items-center gap-2 flex-1">
                                <Input
                                    value={columnTitle}
                                    onChange={(e) => setColumnTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleColumnTitleSave();
                                        if (e.key === "Escape") handleColumnTitleCancel();
                                    }}
                                    className="text-sm h-8"
                                    autoFocus
                                />
                                <Button variant="ghost" size="sm" onClick={handleColumnTitleSave}>
                                    ✓
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleColumnTitleCancel}>
                                    ✕
                                </Button>
                            </div>
                        ) : (
                            <div
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={handleColumnTitleEdit}
                            >
                                <CardTitle className="text-sm">{column.title}</CardTitle>
                                <span className="text-xs text-muted-foreground">
                                    {cards.length}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={openAddModal}>
                            Add
                        </Button>
                        {onDeleteColumn && (
                            <Button variant="ghost" size="sm" onClick={handleColumnDelete}>
                                Delete Column
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent
                    ref={setDroppableRef}
                    className="space-y-3 overflow-y-auto scrollbar-hide [&::-webkit-scrollbar]:hidden max-h-[calc(100vh-200px)]"
                >
                    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                        {cards.map((card) => {
                            return (
                                <SortableTask key={card.id} id={card.id}>
                                    <KanbanCard card={card} />
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDeleteCard(column.id, card.id)}
                                        >
                                            Delete
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditModal(card)}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                </SortableTask>
                            );
                        })}

                        {cards.length === 0 ? (
                            <div className="rounded-lg border border-dashed bg-background/60 p-6 text-center text-sm text-muted-foreground">
                                No cards yet
                            </div>
                        ) : null}
                    </SortableContext>
                </CardContent>
            </Card>

            {isOpen ? (
                <div className="kanban-modal-overlay">
                    <div className="kanban-modal">
                        <h2 className="text-lg font-semibold">
                            {editingCard
                                ? `Edit task in ${column.title}`
                                : `Add task to ${column.title}`}
                        </h2>
                        <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
                            <Input
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Task title"
                                required
                            />

                            <Select
                                value={selectedColumnId}
                                onValueChange={(value) => setSelectedColumnId(value)}
                            >
                                <SelectTrigger className="kanban-modal-input">
                                    <SelectValue placeholder="Select column" />
                                </SelectTrigger>
                                <SelectContent>
                                    {columns.map((targetColumn) => (
                                        <SelectItem key={targetColumn.id} value={targetColumn.id}>
                                            {targetColumn.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={priority}
                                onValueChange={(value) => setPriority(value as Priority)}
                            >
                                <SelectTrigger className="kanban-modal-input">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low priority</SelectItem>
                                    <SelectItem value="medium">Medium priority</SelectItem>
                                    <SelectItem value="high">High priority</SelectItem>
                                </SelectContent>
                            </Select>

                            <textarea
                                className="kanban-modal-textarea"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Task description"
                                rows={3}
                            />

                            <div className="flex flex-col gap-2 text-sm">
                                <span className="font-medium">Tags</span>
                                <div className="flex flex-wrap gap-2">
                                    {KNOWN_TAGS.map((tag) => {
                                        const typedTag = tag;
                                        const checked = tags.includes(typedTag);
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                className={`rounded-full border px-3 py-1 text-xs ${checked ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}`}
                                                onClick={() => {
                                                    setTags((current) =>
                                                        checked
                                                            ? current.filter((t) => t !== typedTag)
                                                            : [...current, typedTag],
                                                    );
                                                }}
                                            >
                                                {tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <Input
                                value={assignees}
                                onChange={(event) => setAssignees(event.target.value)}
                                placeholder="Assignees (comma separated)"
                            />

                            <div className="kanban-modal-actions">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setIsOpen(false);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                {!editingCard ? (
                                    <Button type="submit" size="sm">
                                        Add
                                    </Button>
                                ) : (
                                    <Button type="submit" size="sm">
                                        Edit
                                    </Button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </>
    );
}
