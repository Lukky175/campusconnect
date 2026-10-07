import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import { useState } from "react";

import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";


/*
 * ---------------------------------------------------------
 * Workspace navigation
 * ---------------------------------------------------------
 *
 * These are pages available to normal authenticated users.
 *
 * The page itself is registered here so the sidebar knows:
 * - what label to display
 * - where to navigate
 * - which icon to use
 *
 * This is NOT where roles are assigned.
 */
const navItems = [
  {
    label: "Overview",
    to: "/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Events",
    to: "/dashboard/events",
    icon: CalendarDays,
  },
  {
    label: "My Registrations",
    to: "/dashboard/registrations",
    icon: ClipboardCheck,
  },
  {
    label: "Profile",
    to: "/dashboard/profile",
    icon: UserRound,
  },
  {
    label: "Settings",
    to: "/dashboard/settings",
    icon: Settings,
  },
];


/*
 * ---------------------------------------------------------
 * Administration navigation
 * ---------------------------------------------------------
 *
 * Each admin page declares the permission required to see it.
 *
 * IMPORTANT:
 * This only controls what appears in the UI.
 *
 * The backend still protects the actual API endpoint with
 * @permission_required(...).
 */
const adminNavItems = [
  {
    label: "Users",
    to: "/dashboard/admin/users",
    icon: UsersRound,
    permission: "users.view",
  },
  {
    label: "Manage Events",
    to: "/dashboard/admin/events",
    icon: CalendarDays,
    permission: "events.create",
  },
  {
    label: "Roles & Permissions",
    to: "/dashboard/admin/roles",
    icon: ShieldCheck,
    permission: "roles.manage",
  },
];


export default function DashboardLayout() {
  const {
    theme,
    toggleTheme,
  } = useTheme();

  const {
    user,
    logout,
    hasPermission,
  } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const navigate = useNavigate();


  /*
   * -------------------------------------------------------
   * Logout
   * -------------------------------------------------------
   *
   * AuthContext handles removing the JWT and cached user.
   */
  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };


  /*
   * -------------------------------------------------------
   * Filter administration pages
   * -------------------------------------------------------
   *
   * Example:
   *
   * admin has:
   *   users.view
   *   events.create
   *   roles.manage
   *
   * => sees all three pages.
   *
   * A club_head might only have:
   *   events.create
   *
   * => sees only "Manage Events".
   */
  const visibleAdminItems =
    adminNavItems.filter(
      (item) =>
        !item.permission ||
        hasPermission(item.permission)
    );


  const Sidebar = () => (
    <aside className="flex h-full flex-col bg-[var(--cc-surface)]">

      {/* ---------------------------------------------------
          Logo
      --------------------------------------------------- */}
      <div className="flex h-16 items-center justify-between border-b border-[var(--cc-border)] px-5">

        <NavLink
          to="/dashboard"
          className="font-semibold tracking-tight text-[var(--cc-heading)]"
          onClick={() =>
            setMobileOpen(false)
          }
        >
          Campus
          <span className="text-[var(--cc-primary)]">
            Connect
          </span>
        </NavLink>

        <button
          type="button"
          className="focus-ring rounded-md p-2 text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)] md:hidden"
          onClick={() =>
            setMobileOpen(false)
          }
          aria-label="Close navigation"
        >
          <X className="size-4" />
        </button>

      </div>


      {/* ---------------------------------------------------
          Navigation
      --------------------------------------------------- */}
      <nav className="flex-1 space-y-6 overflow-y-auto p-3">

        {/* =================================================
            Workspace
        ================================================= */}
        <div>

          <p className="px-3 pb-2 pt-2 text-xs font-medium uppercase tracking-wider text-[var(--cc-text-soft)]">
            Workspace
          </p>

          <div className="space-y-1">

            {navItems.map(
              ({
                label,
                to,
                icon: Icon,
                end,
              }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() =>
                    setMobileOpen(false)
                  }
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-[var(--cc-radius-md)] px-3 py-2.5 text-sm transition ${
                      isActive
                        ? "bg-[var(--cc-primary-soft)] font-medium text-[var(--cc-primary)]"
                        : "text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)] hover:text-[var(--cc-text)]"
                    }`
                  }
                >
                  <Icon className="size-4 shrink-0" />

                  <span>
                    {label}
                  </span>
                </NavLink>
              )
            )}

          </div>

        </div>


        {/* =================================================
            Administration
        ================================================= */}
        {visibleAdminItems.length > 0 && (
          <div>

            <p className="px-3 pb-2 pt-2 text-xs font-medium uppercase tracking-wider text-[var(--cc-text-soft)]">
              Administration
            </p>

            <div className="space-y-1">

              {visibleAdminItems.map(
                ({
                  label,
                  to,
                  icon: Icon,
                }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-[var(--cc-radius-md)] px-3 py-2.5 text-sm transition ${
                        isActive
                          ? "bg-[var(--cc-primary-soft)] font-medium text-[var(--cc-primary)]"
                          : "text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)] hover:text-[var(--cc-text)]"
                      }`
                    }
                  >
                    <Icon className="size-4 shrink-0" />

                    <span>
                      {label}
                    </span>
                  </NavLink>
                )
              )}

            </div>

          </div>
        )}

      </nav>


      {/* ---------------------------------------------------
          User section
      --------------------------------------------------- */}
      <div className="border-t border-[var(--cc-border)] p-3">

        <div className="mb-2 rounded-[var(--cc-radius-md)] bg-[var(--cc-surface-subtle)] px-3 py-3">

          <p className="truncate text-sm font-medium text-[var(--cc-heading)]">
            {user?.name || "Student"}
          </p>

          <p className="mt-0.5 truncate text-xs text-[var(--cc-text-muted)]">
            {user?.email || ""}
          </p>

          <span className="mt-2 inline-flex rounded-full bg-[var(--cc-primary-soft)] px-2 py-0.5 text-[11px] font-medium capitalize text-[var(--cc-primary)]">
            {user?.role || "student"}
          </span>

        </div>


        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-[var(--cc-radius-md)] px-3 py-2.5 text-sm text-[var(--cc-text-muted)] transition hover:bg-[var(--cc-danger-soft)] hover:text-[var(--cc-danger)]"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />

          Sign out
        </button>

      </div>

    </aside>
  );


  return (
    <div className="min-h-screen bg-[var(--cc-bg)] md:flex">

      {/* =================================================
          Desktop sidebar
      ================================================= */}
      <div className="hidden w-64 shrink-0 border-r border-[var(--cc-border)] md:block">

        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>

      </div>


      {/* =================================================
          Mobile sidebar
      ================================================= */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">

          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setMobileOpen(false)
            }
          />

          <div className="relative h-full w-72 shadow-[var(--cc-shadow-md)]">
            <Sidebar />
          </div>

        </div>
      )}


      {/* =================================================
          Main application
      ================================================= */}
      <section className="min-w-0 flex-1">

        {/* -------------------------------------------------
            Header
        ------------------------------------------------- */}
        <header className="flex h-16 items-center justify-between border-b border-[var(--cc-border)] bg-[var(--cc-surface)] px-4 md:px-6">

          {/* Mobile menu */}
          <button
            type="button"
            className="focus-ring rounded-md p-2 text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)] md:hidden"
            onClick={() =>
              setMobileOpen(true)
            }
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>


          <div className="ml-auto flex items-center gap-2">

            {/* ---------------------------------------------
                Theme toggle
            --------------------------------------------- */}
            <button
              type="button"
              className="focus-ring rounded-md p-2 text-[var(--cc-text-muted)] transition hover:bg-[var(--cc-surface-subtle)] hover:text-[var(--cc-text)]"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>


            {/* ---------------------------------------------
                User name
            --------------------------------------------- */}
            <div className="hidden border-l border-[var(--cc-border)] pl-3 sm:block">

              <p className="text-sm font-medium text-[var(--cc-heading)]">
                {user?.name || "Student"}
              </p>

            </div>

          </div>

        </header>


        {/* -------------------------------------------------
            Page content
        ------------------------------------------------- */}
        <main className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>

      </section>

    </div>
  );
}