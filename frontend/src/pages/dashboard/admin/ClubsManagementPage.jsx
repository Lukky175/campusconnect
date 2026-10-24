import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Code2, Pencil, Plus, Trash2, X } from "lucide-react";
import Button from "../../../components/common/Button";
import { useToast } from "../../../context/ToastContext";
import { api } from "../../../services/api";

const EMPTY = { name: "", short_name: "", slug: "", category: "Programming & software development", summary: "", description: "", focus_areas: "", links: "", status: "published", display_order: 0 };

export default function ClubsManagementPage() {
  const toast = useToast();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [ordering, setOrdering] = useState(false);

  async function load() {
    setLoading(true);
    try { const data = await api.getAdminClubs(); setClubs(data.clubs || []); }
    catch (error) { toast.error(error.message || "Unable to load clubs."); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function startEdit(club = null) {
    setEditing(club);
    setFormOpen(true);
    setForm(club ? { ...EMPTY, ...club, focus_areas: (club.focus_areas || []).join(", "), links: (club.links || []).map((item) => `${item.label}|${item.url}`).join("\n") } : EMPTY);
  }
  function setField(key, value) { setForm((current) => ({ ...current, [key]: value })); }
  async function save(event) {
    event.preventDefault(); if (saving) return;
    const payload = { ...form, focus_areas: form.focus_areas.split(",").map((item) => item.trim()).filter(Boolean), links: form.links.split("\n").map((line) => { const [label, ...url] = line.split("|"); return { label: label?.trim(), url: url.join("|").trim() }; }).filter((link) => link.label && link.url), display_order: Number(form.display_order) || 0 };
    setSaving(true);
    try { if (editing) await api.updateClub(editing._id, payload); else await api.createClub(payload); toast.success(editing ? "Club updated." : "Club created."); setEditing(null); setFormOpen(false); setForm(EMPTY); await load(); }
    catch (error) { toast.error(error.message || "Unable to save club."); }
    finally { setSaving(false); }
  }
  async function remove(club) {
    if (!window.confirm(`Delete ${club.name}? This removes it from the public directory.`)) return;
    try { await api.deleteClub(club._id); setClubs((items) => items.filter((item) => item._id !== club._id)); toast.success("Club removed."); }
    catch (error) { toast.error(error.message || "Unable to remove club."); }
  }
  async function moveClub(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= clubs.length || ordering) return;
    const reordered = [...clubs];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const updates = reordered.map((club, position) => ({ ...club, display_order: position + 1 }));
    setOrdering(true);
    try {
      await Promise.all(updates.map((club) => api.updateClub(club._id, { ...club, display_order: club.display_order })));
      setClubs(updates);
      toast.success("Club order saved.");
    } catch (error) {
      toast.error(error.message || "Unable to save this order.");
      await load();
    } finally { setOrdering(false); }
  }

  return <div className="mx-auto max-w-6xl space-y-7">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[var(--cc-primary)]">Administration</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--cc-heading)]">Tech clubs</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)]">Manage the database records used by the public and student club directories.</p></div><Button onClick={() => startEdit()}><Plus className="size-4" /> Add club</Button></header>
    {formOpen && <section className="rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]"><div className="flex items-center justify-between border-b border-[var(--cc-border)] px-5 py-4 sm:px-6"><div><h2 className="font-semibold text-[var(--cc-heading)]">{editing ? `Edit ${editing.name}` : "Add a club"}</h2><p className="mt-1 text-xs text-[var(--cc-text-muted)]">Fields marked required are shown in the public directory.</p></div><button type="button" onClick={() => { setEditing(null); setFormOpen(false); setForm(EMPTY); }} className="rounded-lg p-2 text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]" aria-label="Close editor"><X className="size-4" /></button></div>
      <form onSubmit={save} className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">{[
        ["name", "Club name", true], ["short_name", "Short name", false], ["slug", "URL slug (optional)", false], ["category", "Interest area", true], ["display_order", "Display order", false, "number"],
      ].map(([key, label, required, type = "text"]) => <Field key={key} label={label} type={type} required={required} value={form[key]} onChange={(value) => setField(key, value)} />)}
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">Status</span><select value={form.status} onChange={(event) => setField("status", event.target.value)} className="focus-ring h-11 w-full rounded-lg border border-[var(--cc-border)] bg-[var(--cc-bg)] px-3 text-sm text-[var(--cc-text)]">{["draft", "published", "inactive"].map((status) => <option key={status}>{status}</option>)}</select></label>
        <div className="sm:col-span-2"><Field label="Short summary" required value={form.summary} onChange={(value) => setField("summary", value)} /></div>
        <TextArea label="Full description" value={form.description} onChange={(value) => setField("description", value)} />
        <TextArea label="Focus areas (comma separated)" value={form.focus_areas} onChange={(value) => setField("focus_areas", value)} />
        <div className="sm:col-span-2"><TextArea label="Links (one per line: label|https://example.com)" value={form.links} onChange={(value) => setField("links", value)} /></div>
        <div className="flex justify-end gap-2 border-t border-[var(--cc-border)] pt-4 sm:col-span-2"><Button variant="secondary" type="button" onClick={() => { setEditing(null); setFormOpen(false); setForm(EMPTY); }}>Cancel</Button><Button type="submit" loading={saving}>{editing ? "Save changes" : "Create club"}</Button></div>
      </form></section>}

    <section className="overflow-hidden rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]"><div className="flex items-center justify-between border-b border-[var(--cc-border)] px-5 py-4 sm:px-6"><div><h2 className="font-semibold text-[var(--cc-heading)]">Club directory records</h2><p className="mt-1 text-xs text-[var(--cc-text-muted)]">{clubs.length} total · published records appear publicly</p></div><button onClick={load} className="text-sm font-semibold text-[var(--cc-primary)] hover:underline">Refresh</button></div>
      {loading ? <div className="p-8 text-center text-sm text-[var(--cc-text-muted)]">Loading clubs…</div> : clubs.length ? <div className="divide-y divide-[var(--cc-border)]">{clubs.map((club, index) => <article key={club._id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-6"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><Code2 className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[var(--cc-heading)]">{club.name}</h3><span className="rounded-full bg-[var(--cc-surface-subtle)] px-2.5 py-1 text-[11px] capitalize text-[var(--cc-text-muted)]">{club.status}</span><span className="text-xs tabular-nums text-[var(--cc-text-soft)]">Order {club.display_order ?? index + 1}</span></div><p className="mt-1 text-sm text-[var(--cc-text-muted)]">{club.category} · {club.slug}</p><p className="mt-1 line-clamp-1 text-xs text-[var(--cc-text-soft)]">{club.summary}</p></div><div className="flex shrink-0 items-center gap-2"><div className="flex gap-1"><button type="button" disabled={ordering || index === 0} onClick={() => moveClub(index, -1)} aria-label={`Move ${club.name} up`} title="Move up" className="rounded-lg border border-[var(--cc-border)] p-2 text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)] disabled:opacity-40"><ArrowUp className="size-4" /></button><button type="button" disabled={ordering || index === clubs.length - 1} onClick={() => moveClub(index, 1)} aria-label={`Move ${club.name} down`} title="Move down" className="rounded-lg border border-[var(--cc-border)] p-2 text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)] disabled:opacity-40"><ArrowDown className="size-4" /></button></div><button onClick={() => startEdit(club)} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--cc-border)] px-3 py-2 text-sm text-[var(--cc-text)] hover:bg-[var(--cc-surface-subtle)]"><Pencil className="size-3.5" /> Edit</button><button onClick={() => remove(club)} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--cc-border)] px-3 py-2 text-sm text-[var(--cc-danger)] hover:bg-[var(--cc-danger-soft)]"><Trash2 className="size-3.5" /> Remove</button></div></article>)}</div> : <div className="p-10 text-center text-sm text-[var(--cc-text-muted)]">No club records yet. Add the first one above.</div>}</section>
  </div>;
}

function Field({ label, value, onChange, required = false, type = "text" }) { return <label className="block"><span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">{label}{required && " *"}</span><input type={type} required={required} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className="focus-ring h-11 w-full rounded-lg border border-[var(--cc-border)] bg-[var(--cc-bg)] px-3 text-sm text-[var(--cc-text)]" /></label>; }
function TextArea({ label, value, onChange }) { return <label className="block"><span className="mb-1.5 block text-sm font-medium text-[var(--cc-text)]">{label}</span><textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} className="focus-ring w-full resize-y rounded-lg border border-[var(--cc-border)] bg-[var(--cc-bg)] p-3 text-sm text-[var(--cc-text)]" /></label>; }
