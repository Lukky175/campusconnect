import PublicLayout from "../../components/layout/PublicLayout";

export default function SimpleContentPage({ title, eyebrow, children }) {
  return (
    <PublicLayout>
      <section className="container-page py-16">
        <p className="text-sm font-medium text-[var(--cc-primary)]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--cc-heading)]">{title}</h1>
        <div className="mt-8 max-w-3xl space-y-5 text-sm leading-7 text-[var(--cc-text-muted)]">
          {children}
        </div>
      </section>
    </PublicLayout>
  );
}
