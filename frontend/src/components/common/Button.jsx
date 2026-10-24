import { Link } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

const variants = {
  primary: "bg-[var(--cc-primary)] !text-[var(--cc-on-primary)] hover:bg-[var(--cc-primary-hover)]",
  secondary: "border border-[var(--cc-border-strong)] bg-[var(--cc-surface)] !text-[var(--cc-text)] hover:bg-[var(--cc-surface-subtle)]",
  ghost: "!text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)] hover:!text-[var(--cc-text)]",
  danger: "bg-[var(--cc-danger)] !text-[var(--cc-on-danger)] hover:opacity-90",
};

const baseClasses = "focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--cc-radius-sm)] px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export default function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  to,
  href,
  disabled = false,
  ...props
}) {
  const classes = `${baseClasses} ${variants[variant] || variants.primary} ${className}`;
  const content = <>{loading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}{children}</>;

  if (to) {
    return <Link to={to} className={`${classes} ${disabled || loading ? "pointer-events-none opacity-60" : ""}`} aria-disabled={disabled || loading || undefined} {...props}>{content}</Link>;
  }

  if (href) {
    return <a href={href} className={`${classes} ${disabled || loading ? "pointer-events-none opacity-60" : ""}`} aria-disabled={disabled || loading || undefined} {...props}>{content}</a>;
  }

  return <button className={classes} disabled={loading || disabled} {...props}>{content}</button>;
}
