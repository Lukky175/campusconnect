import { useTheme } from "../../context/ThemeContext";

export default function DashboardSettingsPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-medium text-[var(--cc-primary)]">
          Preferences
        </p>

        <h1 className="mt-1 text-2xl font-semibold text-[var(--cc-heading)] md:text-3xl">
          Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)]">
          Manage your CampusConnect preferences.
        </p>
      </section>

      <section className="max-w-3xl rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
        <div className="border-b border-[var(--cc-border)] p-6">
          <h2 className="font-semibold text-[var(--cc-heading)]">
            Appearance
          </h2>

          <p className="mt-1 text-sm text-[var(--cc-text-muted)]">
            Customize how CampusConnect appears on your
            device.
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 p-6">
          <div>
            <p className="text-sm font-medium text-[var(--cc-text)]">
              Dark mode
            </p>

            <p className="mt-1 text-sm text-[var(--cc-text-muted)]">
              Currently using {theme === "dark" ? "dark" : "light"} mode.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-[var(--cc-radius-md)] border border-[var(--cc-border)] px-4 py-2 text-sm font-medium text-[var(--cc-text)] transition hover:bg-[var(--cc-surface-subtle)]"
          >
            Switch to {theme === "dark" ? "light" : "dark"}
          </button>
        </div>
      </section>

      <section className="max-w-3xl rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
        <div className="p-6">
          <h2 className="font-semibold text-[var(--cc-heading)]">
            Notifications
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--cc-text-muted)]">
            Notification preferences will be available
            here when event reminders and other
            CampusConnect notifications are implemented.
          </p>
        </div>
      </section>
    </div>
  );
}