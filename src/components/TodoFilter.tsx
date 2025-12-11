import { cn } from "@/lib/utils";

export type FilterType = "all" | "active" | "completed";

interface TodoFilterProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
  };
}

export const TodoFilter = ({ filter, onFilterChange, counts }: TodoFilterProps) => {
  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Done" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 p-1 rounded-xl bg-secondary/50">
      {filters.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onFilterChange(value)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            filter === value
              ? "bg-card text-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
          <span
            className={cn(
              "ml-2 text-xs",
              filter === value ? "text-primary" : "text-muted-foreground"
            )}
          >
            {counts[value]}
          </span>
        </button>
      ))}
    </div>
  );
};
