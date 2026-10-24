import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import Button from "../common/Button";
import { useTheme } from "../../context/ThemeContext";

const links = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/events" },
  { label: "Tech Clubs", to: "/clubs" },
  { label: "Blog", to: "/blog" },
  { label: "About", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

export default function PublicNavbar() {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-3 z-50 px-2 sm:top-5 sm:px-4">
      <div className="container-page relative">
        <div className="flex h-12 items-center justify-between rounded-full border border-[var(--cc-border)] bg-[var(--cc-surface)]/90 px-4 shadow-[var(--cc-shadow-md)] backdrop-blur-xl sm:h-16 sm:px-6">
          <Link to="/" onClick={closeMenu} aria-label="CampusConnect home" className="shrink-0 text-base font-semibold tracking-tight text-[var(--cc-heading)] sm:text-lg">
            Campus<span className="text-[var(--cc-primary)]">Connect</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
            {links.map(({ label, to }) => <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `group relative rounded-full px-2.5 py-2 text-sm font-medium transition-colors xl:px-3 ${isActive ? "text-[var(--cc-primary)]" : "text-[var(--cc-text-muted)] hover:text-[var(--cc-primary)]"}`}>
              {label}<span className="absolute inset-x-3 -bottom-0.5 h-0.5 scale-x-0 rounded-full bg-[var(--cc-primary)] transition-transform group-hover:scale-x-100" />
            </NavLink>)}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button type="button" onClick={toggleTheme} aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"} title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"} className="focus-ring flex size-9 items-center justify-center rounded-full border border-[var(--cc-border-strong)] text-[var(--cc-text-muted)] transition hover:border-[var(--cc-primary)] hover:text-[var(--cc-primary)] sm:size-11">
              {theme === "dark" ? <Sun className="size-4 sm:size-[19px]" /> : <Moon className="size-4 sm:size-[19px]" />}
            </button>
            <Button to="/login" variant="primary" className="hidden rounded-full md:inline-flex">Get started</Button>
            <button type="button" onClick={() => setIsMenuOpen((open) => !open)} aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={isMenuOpen} className="focus-ring flex size-9 items-center justify-center rounded-full border border-[var(--cc-border-strong)] text-[var(--cc-text-muted)] transition hover:border-[var(--cc-primary)] hover:text-[var(--cc-primary)] lg:hidden">
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && <nav aria-label="Mobile navigation" className="mt-2 rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface)]/95 p-2 shadow-[var(--cc-shadow-md)] backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map(({ label, to }) => <NavLink key={to} to={to} end={to === "/"} onClick={closeMenu} className={({ isActive }) => `rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? "bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]" : "text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)] hover:text-[var(--cc-primary)]"}`}>{label}</NavLink>)}
            <div className="mt-1 border-t border-[var(--cc-border)] pt-2"><Button to="/login" onClick={closeMenu} className="w-full rounded-xl">Get started</Button></div>
          </div>
        </nav>}
      </div>
    </header>
  );
}
