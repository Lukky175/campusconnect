import { useCallback, useEffect, useState } from "react";
import { MapPin, Plus, Save, Trash2 } from "lucide-react";
import Button from "../../../components/common/Button";
import { useToast } from "../../../context/ToastContext";
import { api } from "../../../services/api";

const EMPTY_SETTINGS = { phone: "", email: "", address: "", office_hours: "", faqs: [] };

export default function WebsiteSettingsPage() {
  const toast = useToast();
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const data = await api.getAdminWebsiteSettings();
      setSettings({ ...EMPTY_SETTINGS, ...data, faqs: data.faqs || [] });
    } catch (error) {
      toast.error(error.message || "Unable to load website settings.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const updateContact = (event) => setSettings((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updateFaq = (id, field, value) => setSettings((current) => ({
    ...current,
    faqs: current.faqs.map((faq) => faq.id === id ? { ...faq, [field]: value } : faq),
  }));
  const addFaq = () => setSettings((current) => ({
    ...current,
    faqs: [...current.faqs, { id: globalThis.crypto?.randomUUID?.() || `faq-${Date.now()}`, question: "", answer: "" }],
  }));
  const removeFaq = (id) => setSettings((current) => ({ ...current, faqs: current.faqs.filter((faq) => faq.id !== id) }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const data = await api.updateAdminWebsiteSettings(settings);
      setSettings({ ...EMPTY_SETTINGS, ...data, faqs: data.faqs || [] });
      toast.success("Website settings saved.");
    } catch (error) {
      toast.error(error.message || "Unable to save website settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-16 text-center text-sm text-[var(--cc-text-muted)]">Loading website settings…</div>;

  return <div className="mx-auto max-w-4xl">
    <div className="mb-8">
      <p className="text-sm font-medium text-[var(--cc-primary)]">Administration</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--cc-heading)]">Website settings</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)]">Manage the public contact details and FAQ content shown on the CampusConnect website.</p>
    </div>

    <form onSubmit={save} className="space-y-8">
      <section className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-sm)] sm:p-7">
        <div className="mb-6 flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><MapPin className="size-4" /></span>
          <div><h2 className="text-lg font-semibold text-[var(--cc-heading)]">Contact details</h2><p className="mt-1 text-sm text-[var(--cc-text-muted)]">These details appear on the public Contact Us page.</p></div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <SettingsField label="Contact phone" name="phone" value={settings.phone} onChange={updateContact} type="tel" placeholder="+91 …" />
          <SettingsField label="Contact email" name="email" value={settings.email} onChange={updateContact} type="email" placeholder="hello@example.com" />
          <SettingsField label="Address / location" name="address" value={settings.address} onChange={updateContact} className="sm:col-span-2" multiline placeholder="Campus, city, state" />
          <SettingsField label="Office hours" name="office_hours" value={settings.office_hours} onChange={updateContact} className="sm:col-span-2" placeholder="Monday–Friday, 9:00 AM–5:00 PM" />
        </div>
      </section>

      <section className="rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-[var(--cc-shadow-sm)] sm:p-7">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-semibold text-[var(--cc-heading)]">Frequently asked questions</h2><p className="mt-1 text-sm text-[var(--cc-text-muted)]">Add, edit, or remove questions shown on the public FAQ page.</p></div>
          <Button type="button" variant="secondary" onClick={addFaq}><Plus className="size-4" /> Add question</Button>
        </div>
        {settings.faqs.length === 0 ? <p className="rounded-lg bg-[var(--cc-surface-subtle)] p-5 text-sm text-[var(--cc-text-muted)]">No questions yet. Add one to start building the FAQ page.</p> : <div className="space-y-4">
          {settings.faqs.map((faq, index) => <article key={faq.id} className="rounded-lg border border-[var(--cc-border)] p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[var(--cc-heading)]">Question {index + 1}</p><button type="button" onClick={() => removeFaq(faq.id)} className="focus-ring inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-[var(--cc-danger)] hover:bg-[var(--cc-danger-soft)]"><Trash2 className="size-3.5" /> Remove</button></div>
            <div className="space-y-4">
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">Question</span><input required maxLength={500} value={faq.question} onChange={(event) => updateFaq(faq.id, "question", event.target.value)} className="focus-ring h-11 w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border-strong)] bg-[var(--cc-bg)] px-3 text-sm text-[var(--cc-text)]" placeholder="Enter a question" /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">Answer</span><textarea required maxLength={10000} rows={4} value={faq.answer} onChange={(event) => updateFaq(faq.id, "answer", event.target.value)} className="focus-ring w-full resize-y rounded-[var(--cc-radius-sm)] border border-[var(--cc-border-strong)] bg-[var(--cc-bg)] px-3 py-2.5 text-sm leading-6 text-[var(--cc-text)]" placeholder="Write a clear answer" /></label>
            </div>
          </article>)}
        </div>}
      </section>

      <div className="flex justify-end pb-6"><Button type="submit" loading={saving}><Save className="size-4" /> Save website settings</Button></div>
    </form>
  </div>;
}

function SettingsField({ label, name, value, onChange, className = "", multiline = false, ...props }) {
  const controlClass = "focus-ring w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border-strong)] bg-[var(--cc-bg)] px-3 text-sm text-[var(--cc-text)] placeholder:text-[var(--cc-text-soft)]";
  return <label className={`block ${className}`}>
    <span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">{label}</span>
    {multiline ? <textarea name={name} value={value} onChange={onChange} rows={3} maxLength={2000} className={`${controlClass} py-2.5`} {...props} /> : <input name={name} value={value} onChange={onChange} maxLength={2000} className={`${controlClass} h-11`} {...props} />}
  </label>;
}
