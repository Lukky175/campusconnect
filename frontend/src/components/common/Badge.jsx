const tones = {
  neutral: "bg-[var(--cc-surface-subtle)] text-[var(--cc-text-muted)]",
  primary: "bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]",
  success: "bg-[var(--cc-success-soft)] text-[var(--cc-success)]",
  warning: "bg-[var(--cc-warning-soft)] text-[var(--cc-warning)]",
};

export default function Badge({ children, tone = "neutral" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
