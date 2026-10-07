import { LoaderCircle } from "lucide-react";

const variants = {
  primary: "bg-[var(--cc-primary)] text-[var(--cc-on-primary)] hover:bg-[var(--cc-primary-hover)]",
  secondary: "border border-[var(--cc-border-strong)] bg-[var(--cc-surface)] text-[var(--cc-text)] hover:bg-[var(--cc-surface-subtle)]",
  ghost: "text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)] hover:text-[var(--cc-text)]",
  danger: "bg-[var(--cc-danger)] text-white hover:opacity-90",
};

export default function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...props
}) {
  return (
    <button
      className={`focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--cc-radius-sm)] px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <LoaderCircle className="size-4 animate-spin" />}
      {children}
    </button>
  );
}
