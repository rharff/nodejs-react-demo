import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TodoInputProps {
  onAdd: (text: string) => void;
}

export const TodoInput = ({ onAdd }: TodoInputProps) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What needs to be done?"
        className={cn(
          "w-full px-5 py-4 pr-14 rounded-xl bg-card shadow-soft",
          "text-foreground placeholder:text-muted-foreground",
          "border-2 border-transparent transition-all duration-200",
          "focus:outline-none focus:border-primary/30 focus:shadow-medium"
        )}
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2",
          "p-2 rounded-lg bg-primary text-primary-foreground",
          "transition-all duration-200",
          "hover:shadow-glow hover:scale-105",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
        )}
        aria-label="Add task"
      >
        <Plus className="h-5 w-5" />
      </button>
    </form>
  );
};
