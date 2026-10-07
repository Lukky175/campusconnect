import { SearchX } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--cc-radius-lg)] border border-dashed border-[var(--cc-border-strong)] bg-[var(--cc-surface)] px-6 py-14 text-center">
      <SearchX className="mb-4 size-8 text-[var(--cc-text-soft)]" />
      <h3 className="text-base font-semibold text-[var(--cc-heading)]">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-[var(--cc-text-muted)]">{description}</p>}
    </div>
  );
}
