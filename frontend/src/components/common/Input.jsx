export default function Input({ label, error, className = "", ...props }) {
  const id = props.id || props.name;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--cc-text)]">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`focus-ring w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3.5 py-2.5 text-sm text-[var(--cc-text)] placeholder:text-[var(--cc-text-soft)] outline-none transition-colors focus:border-[var(--cc-primary)] ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[var(--cc-danger)]">{error}</p>}
    </div>
  );
}
