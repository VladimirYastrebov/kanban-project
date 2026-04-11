// App.tsx
/* eslint-disable react-refresh/only-export-components */
import { useBoard } from "./contexts/BoardContext";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";

function App() {
  const { columns, loading, error, addCard, deleteCard, editCard, moveCard } = useBoard();
  const columnIds = columns.map((column) => column.id);

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
              {columns.length} columns • {columns.reduce((acc, col) => acc + (col.cards?.length || 0), 0)} cards
            </p>
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