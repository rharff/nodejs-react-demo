import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodoItemProps {
  id: string;
  text: string;
  completed: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoItem = ({ id, text, completed, onToggle, onDelete }: TodoItemProps) => {
  return (
    <div
      className={cn(
        "group flex items-center gap-4 p-4 rounded-lg bg-card shadow-soft transition-all duration-300 animate-slide-up",
        "hover:shadow-medium hover:-translate-y-0.5",
        completed && "opacity-60"
      )}
    >
      <Checkbox
        checked={completed}
        onCheckedChange={() => onToggle(id)}
        aria-label={`Mark "${text}" as ${completed ? "incomplete" : "complete"}`}
      />
      <span
        className={cn(
          "flex-1 text-foreground transition-all duration-300",
          completed && "line-through text-muted-foreground"
        )}
      >
        {text}
      </span>
      <button
        onClick={() => onDelete(id)}
        className={cn(
          "p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200",
          "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        )}
        aria-label={`Delete "${text}"`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};
