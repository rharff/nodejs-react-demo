import { useState, useMemo } from "react";
import { TodoItem } from "@/components/TodoItem";
import { TodoInput } from "@/components/TodoInput";
import { TodoFilter, FilterType } from "@/components/TodoFilter";
import { ListChecks } from "lucide-react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const Index = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", text: "Build something beautiful", completed: false },
    { id: "2", text: "Take a break", completed: false },
    { id: "3", text: "Plan tomorrow", completed: true },
  ]);
  const [filter, setFilter] = useState<FilterType>("all");

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
    };
    setTodos((prev) => [newTodo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const counts = useMemo(
    () => ({
      all: todos.length,
      active: todos.filter((t) => !t.completed).length,
      completed: todos.filter((t) => t.completed).length,
    }),
    [todos]
  );

  return (
    <main className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-2 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <ListChecks className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-display text-foreground">My Tasks</h1>
          <p className="text-muted-foreground">
            {counts.active === 0
              ? "All done! Time to relax."
              : `${counts.active} task${counts.active !== 1 ? "s" : ""} remaining`}
          </p>
        </header>

        {/* Input */}
        <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <TodoInput onAdd={addTodo} />
        </section>

        {/* Filter */}
        <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <TodoFilter filter={filter} onFilterChange={setFilter} counts={counts} />
        </section>

        {/* Todo List */}
        <section className="space-y-3">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground animate-fade-in">
              {filter === "all"
                ? "No tasks yet. Add one above!"
                : filter === "active"
                ? "No active tasks. Great job!"
                : "No completed tasks yet."}
            </div>
          ) : (
            filteredTodos.map((todo, index) => (
              <div
                key={todo.id}
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <TodoItem
                  id={todo.id}
                  text={todo.text}
                  completed={todo.completed}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                />
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
};

export default Index;
