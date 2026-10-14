import { useEffect, useState } from "react";
import { ArrowRight, Clock3, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import Button from "../../components/common/Button";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";

const initialForm = { first_name: "", last_name: "", phone: "", email: "", topic: "", query: "" };

export default function ContactUsPage() {
  const toast = useToast();
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    api.getWebsiteSettings()
      .then((data) => { if (active) setSettings(data); })
      .catch((error) => { if (active) toast.error(error.message || "Unable to load contact details."); });
    return () => { active = false; };
  }, [toast]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      await api.submitContactMessage(form);
      setForm(initialForm);
      toast.success("Thanks for reaching out. Your message has been sent.");
    } catch (error) {
      toast.error(error.message || "Unable to send your message.");
    } finally {
      setSending(false);
    }
  };

  return <PublicLayout>
    <section className="relative isolate flex min-h-64 items-center overflow-hidden bg-slate-900 sm:min-h-80">
      <img src="/Bennett.webp" alt="Bennett University campus" className="absolute inset-0 -z-20 size-full object-cover object-center" />
      <div className="absolute inset-0 -z-10 bg-black/55" />
      <div className="container-page py-16 sm:py-20">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/75">CampusConnect</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-6xl">Contact Us</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-white/80">Have a question, suggestion, or something you would like us to know? We’d love to hear from you.</p>
      </div>
    </section>

    <section className="container-page grid gap-10 py-12 md:grid-cols-[0.8fr_1.2fr] md:gap-16 md:py-16">
      <aside>
        <p className="text-sm font-medium text-[var(--cc-primary)]">Get in touch</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--cc-heading)]">We’re here to help.</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--cc-text-muted)]">Reach the CampusConnect team using the details below, or send us a message using the form.</p>
        <div className="mt-8 space-y-6">
          <ContactDetail icon={Phone} label="Phone" value={settings?.phone} href={settings?.phone ? `tel:${settings.phone.replace(/[^+\d]/g, "")}` : undefined} />
          <ContactDetail icon={Mail} label="Email" value={settings?.email} href={settings?.email ? `mailto:${settings.email}` : undefined} />
          <ContactDetail icon={MapPin} label="Location" value={settings?.address} />
          <ContactDetail icon={Clock3} label="Office hours" value={settings?.office_hours} />
        </div>
        {!settings?.phone && !settings?.email && <p className="mt-6 rounded-lg bg-[var(--cc-surface-subtle)] p-4 text-sm text-[var(--cc-text-muted)]">Contact details will appear here once they are added by an administrator.</p>}
      </aside>

      <form onSubmit={submit} className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-sm)] sm:p-8">
        <h2 className="text-xl font-semibold text-[var(--cc-heading)]">Send us a message</h2>
        <p className="mt-1 text-sm text-[var(--cc-text-muted)]">Fields marked <span className="text-red-500">*</span> are required.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="First name" name="first_name" value={form.first_name} onChange={update} autoComplete="given-name" />
          <Field label="Last name" name="last_name" value={form.last_name} onChange={update} autoComplete="family-name" />
          <Field label="Phone number" name="phone" type="tel" value={form.phone} onChange={update} autoComplete="tel" />
          <Field label="Email" name="email" type="email" value={form.email} onChange={update} autoComplete="email" />
          <Field label="Query topic" name="topic" value={form.topic} onChange={update} className="sm:col-span-2" placeholder="What is your message about?" />
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">Query <Required /></span>
            <textarea required maxLength={10000} name="query" value={form.query} onChange={update} rows={5} className="focus-ring w-full resize-y rounded-[var(--cc-radius-sm)] border border-[var(--cc-border-strong)] bg-[var(--cc-bg)] px-3 py-2.5 text-sm text-[var(--cc-text)] placeholder:text-[var(--cc-text-soft)]" placeholder="Write your message here…" />
          </label>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <Button type="submit" loading={sending}>Send message</Button>
          <Link to="/faq" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--cc-primary)] hover:underline">Visit our FAQ <ArrowRight className="size-4" /></Link>
        </div>
      </form>
    </section>
  </PublicLayout>;
}

function Required() { return <span className="text-red-500" aria-hidden="true">*</span>; }

function Field({ label, name, value, onChange, type = "text", className = "", ...props }) {
  return <label className={`block ${className}`}>
    <span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">{label} <Required /></span>
    <input required maxLength={name === "email" ? 254 : name === "phone" ? 40 : 160} type={type} name={name} value={value} onChange={onChange} className="focus-ring h-11 w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border-strong)] bg-[var(--cc-bg)] px-3 text-sm text-[var(--cc-text)] placeholder:text-[var(--cc-text-soft)]" {...props} />
  </label>;
}

function ContactDetail({ icon: Icon, label, value, href }) {
  if (!value) return null;
  const content = <span className="text-sm leading-6 text-[var(--cc-text)]">{value}</span>;
  return <div className="flex gap-4">
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><Icon className="size-4" /></span>
    <div className="min-w-0"><p className="text-sm font-semibold text-[var(--cc-heading)]">{label}</p>{href ? <a className="mt-1 block break-words hover:text-[var(--cc-primary)]" href={href}>{content}</a> : <p className="mt-1">{content}</p>}</div>
  </div>;
}
