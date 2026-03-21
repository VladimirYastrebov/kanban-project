import { BOARD } from "@/components/kanban/boardData";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";

function App() {
  return (
    <main className="min-h-dvh bg-background">
      <div className="container mx-auto space-y-6 px-4 py-10">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Kanban Board</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Simple UI first — behavior later.
            </p>
          </div>
        </header>

        <section
          className="grid gap-6 md:grid-cols-3"
          aria-label="Kanban board"
        >
          {BOARD.map((column) => (
            <KanbanColumn key={column.id} column={column} />
          ))}
        </section>
      </div>
    </main>
  );
}

export default App;
