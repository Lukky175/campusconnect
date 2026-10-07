import PublicNavbar from "./PublicNavbar";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--cc-bg)]">
      <PublicNavbar />

      <main>
        {children}
      </main>

      <footer className="mt-20 border-t border-[var(--cc-border)]">
        <div className="container-page flex flex-col gap-2 py-8 text-sm text-[var(--cc-text-muted)] md:flex-row md:items-center md:justify-between">
          <p>© 2026 CampusConnect</p>

          <p>Discover. Participate. Grow.</p>
        </div>
      </footer>
    </div>
  );
}