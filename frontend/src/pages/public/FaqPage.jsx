import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function FaqPage() {
  const toast = useToast();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(() => new Set());

  useEffect(() => {
    let active = true;
    api.getWebsiteSettings()
      .then((data) => { if (active) setFaqs(data.faqs || []); })
      .catch((error) => { if (active) toast.error(error.message || "Unable to load FAQs."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [toast]);

  const toggle = (id) => setOpen((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return <PublicLayout>
    <section className="relative isolate flex min-h-64 items-center overflow-hidden bg-slate-900 sm:min-h-80">
      <img src="/Bennett_2.webp" alt="Bennett University campus" className="absolute inset-0 -z-20 size-full object-cover object-center" />
      <div className="absolute inset-0 -z-10 bg-black/55" />
      <div className="container-page py-16 sm:py-20">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/75">CampusConnect</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-6xl">Frequently Asked Questions</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-white/80">A few helpful answers about finding your way around CampusConnect.</p>
      </div>
    </section>

    <section className="container-page grid gap-10 py-12 md:grid-cols-[0.72fr_1.28fr] md:gap-16 md:py-16">
      <div>
        <span className="flex size-11 items-center justify-center rounded-full bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><HelpCircle className="size-5" /></span>
        <p className="mt-5 text-sm font-medium text-[var(--cc-primary)]">Need a hand?</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--cc-heading)]">Here are some answers.</h2>
        <p className="mt-4 text-sm leading-6 text-[var(--cc-text-muted)]">Browse the questions on the right. Open as many answers as you need; they can stay expanded together.</p>
        <p className="mt-4 text-sm leading-6 text-[var(--cc-text-muted)]">We’re continually improving the experience for Bennett students, and this page is updated by the CampusConnect team.</p>
      </div>
      <div>
        {loading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-[var(--cc-surface-subtle)]" />)}</div>
          : faqs.length ? <div className="divide-y divide-[var(--cc-border)] border-y border-[var(--cc-border)]">
            {faqs.map((faq) => {
              const expanded = open.has(faq.id);
              return <article key={faq.id} className="py-1">
                <h3>
                  <button type="button" aria-expanded={expanded} aria-controls={`faq-answer-${faq.id}`} onClick={() => toggle(faq.id)} className="focus-ring flex w-full items-center justify-between gap-5 py-5 text-left text-base font-semibold text-[var(--cc-heading)]">
                    {faq.question}<ArrowDown className={`size-4 shrink-0 text-[var(--cc-primary)] transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </button>
                </h3>
                {expanded && <div id={`faq-answer-${faq.id}`} className="whitespace-pre-line pb-5 pr-8 text-sm leading-6 text-[var(--cc-text-muted)]">{faq.answer}</div>}
              </article>;
            })}
          </div> : <div className="rounded-xl border border-[var(--cc-border)] bg-[var(--cc-surface)] p-6 text-sm text-[var(--cc-text-muted)]">There are no FAQs yet. Please check back soon.</div>}
      </div>
    </section>
    <section className="container-page pb-12 md:pb-16">
      <div className="flex flex-col gap-4 rounded-[var(--cc-radius-lg)] bg-[var(--cc-surface-subtle)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div><h2 className="text-lg font-semibold text-[var(--cc-heading)]">Still have a question?</h2><p className="mt-1 text-sm text-[var(--cc-text-muted)]">Send a message and the CampusConnect team will get back to you.</p></div>
        <Link to="/contact" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-[var(--cc-primary)] hover:underline">Contact Us <ArrowUpRight className="size-4" /></Link>
      </div>
    </section>
  </PublicLayout>;
}
