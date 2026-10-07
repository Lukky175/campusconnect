import { Link } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import Button from "../../components/common/Button";

export default function NotFoundPage() {
  return (
    <PublicLayout>
      <section className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-sm font-medium text-[var(--cc-primary)]">404</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--cc-heading)]">Page not found</h1>
        <p className="mt-3 max-w-md text-sm text-[var(--cc-text-muted)]">The page may have moved, or the link may be incorrect.</p>
        <Link to="/" className="mt-6"><Button>Return home</Button></Link>
      </section>
    </PublicLayout>
  );
}
