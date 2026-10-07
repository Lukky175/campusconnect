import { Search, SlidersHorizontal } from "lucide-react";

const filters = [
  "All",
  "Hackathon",
  "Workshop",
  "Competition",
  "Seminar",
];

export default function EventFilters({
  query,
  setQuery,
  filter,
  setFilter,
}) {
  return (
    <div className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-4 shadow-[var(--cc-shadow-sm)]">

      <div className="flex flex-col gap-4 lg:flex-row">

        {/* Search */}
        <div className="flex flex-1 items-center gap-3 rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface-subtle)] px-3.5">

          <Search className="size-4 shrink-0 text-[var(--cc-text-soft)]" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, technologies, colleges..."
            className="h-11 w-full bg-transparent text-sm text-[var(--cc-text)] outline-none placeholder:text-[var(--cc-text-soft)]"
          />

        </div>


        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">

          <SlidersHorizontal className="size-4 shrink-0 text-[var(--cc-text-soft)]" />

          {filters.map((item) => (

            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`whitespace-nowrap rounded-[var(--cc-radius-sm)] px-3.5 py-2 text-sm transition-colors ${
                filter === item
                  ? "bg-[var(--cc-primary)] text-[var(--cc-on-primary)]"
                  : "border border-[var(--cc-border)] bg-[var(--cc-surface)] text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"
              }`}
            >
              {item}
            </button>

          ))}

        </div>

      </div>

    </div>
  );
}