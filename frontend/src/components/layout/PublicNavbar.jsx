import { Link, NavLink } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import Button from "../common/Button";
import { useTheme } from "../../context/ThemeContext";

const links = [
  { label: "Events", to: "/events" },
  { label: "Tech Clubs", to: "/clubs" },
  { label: "Blog", to: "/blog" },
  { label: "About", to: "/about" },
];

export default function PublicNavbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-[var(--cc-border)] bg-[var(--cc-bg)]/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" className="text-lg font-semibold tracking-tight text-[var(--cc-heading)]">
          Campus<span className="text-[var(--cc-primary)]">Connect</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-[var(--cc-surface-subtle)] text-[var(--cc-text)]"
                    : "text-[var(--cc-text-muted)] hover:text-[var(--cc-text)]"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button className="focus-ring rounded-md p-2 text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <Link to="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
