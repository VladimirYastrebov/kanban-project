import { useState } from "react";

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
import type { Column, Priority, Tag } from "./types";

export function KanbanColumn({ column }: { column: Column }) {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<Priority>("low");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<Tag[]>([]);
    const [assignees, setAssignees] = useState("");

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsOpen(false);
        setTitle("");
        setPriority("low");
        setDescription("");
        setTags([]);
        setAssignees("");
    }

    return (
        <>
            <Card aria-label={`${column.title} column`} className="bg-muted/20">
                <CardHeader className="flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-2">
                        <CardTitle className="text-sm">{column.title}</CardTitle>
                        <span className="text-xs text-muted-foreground">{column.cards.length}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
                        Add
                    </Button>
                </CardHeader>

                <CardContent className="space-y-3">
                    {column.cards.map((card) => (
                        <KanbanCard key={card.id} card={card} />
                    ))}

                    {column.cards.length === 0 ? (
                        <div className="rounded-lg border border-dashed bg-background/60 p-6 text-center text-sm text-muted-foreground">
                            No cards yet
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            {isOpen ? (
                <div className="kanban-modal-overlay">
                    <div className="kanban-modal">
                        <h2 className="text-lg font-semibold">Add task to {column.title}</h2>
                        <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
                            <Input
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="Task title"
                                required
                            />

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
                                    {["Web", "Mobile", "Design"].map((tag) => {
                                        const typedTag = tag as Tag;
                                        const checked = tags.includes(typedTag);
                                        return (
                                            <button
                                                key={tag}
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
                                        setTitle("");
                                        setPriority("low");
                                        setDescription("");
                                        setTags([]);
                                        setAssignees("");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" size="sm">
                                    Save
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </>
    );
}
