import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, FileText, Pencil, Plus, Trash2, X } from "lucide-react";
import { api } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  author: "",
  tags: "",
  status: "draft",
};

const STATUSES = ["draft", "published", "inactive"];

export default function BlogManagementPage() {
  const toast = useToast();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [reordering, setReordering] = useState(false);
  const manualSlug = useRef(false);

  const loadBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getAdminBlogs();
      setBlogs(response.blogs || []);
    } catch (error) {
      toast.error(error.message || "Unable to load blogs.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const visibleBlogs = useMemo(
    () => statusFilter === "all"
      ? blogs
      : blogs.filter((blog) => blog.status === statusFilter),
    [blogs, statusFilter],
  );

  const openEditor = (blog) => {
    setEditing(blog);
    setForm({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      cover_image_url: blog.cover_image_url || "",
      author: blog.author || "",
      tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : "",
      status: blog.status || "draft",
    });
    manualSlug.current = Boolean(blog.title && !blog.slug?.startsWith("draft-") && blog.slug !== slugify(blog.title));
    setDirty(false);
  };

  const createDraft = async () => {
    try {
      setCreating(true);
      const response = await api.createBlog();
      const draft = response.blog;
      setBlogs((current) => [...current, draft].sort(compareOrder));
      openEditor(draft);
      toast.success("Draft created. Your edits save automatically.");
    } catch (error) {
      toast.error(error.message || "Unable to create a draft.");
    } finally {
      setCreating(false);
    }
  };

  const updateField = (field, value) => {
    if (field === "slug") manualSlug.current = true;
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "title" && !manualSlug.current) {
        next.slug = slugify(value);
      }
      return next;
    });
    setDirty(true);
  };

  const saveChanges = useCallback(async (currentForm, blog) => {
    setSaving(true);
    const payload = {
      ...currentForm,
      tags: currentForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };
    try {
      const response = await api.updateBlog(blog._id, payload);
      const updated = response.blog;
      setEditing(updated);
      setBlogs((current) => current.map((item) => item._id === updated._id ? updated : item));
      setDirty(false);
    } catch (error) {
      setForm((current) => ({ ...current, status: blog.status }));
      setDirty(false);
      toast.error(error.message || "Unable to save this blog.");
    } finally {
      setSaving(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!editing || !dirty || saving) return undefined;
    const timer = window.setTimeout(() => saveChanges(form, editing), 800);
    return () => window.clearTimeout(timer);
  }, [dirty, editing, form, saveChanges, saving]);

  const changeStatus = async (blog, status) => {
    try {
      const response = await api.updateBlog(blog._id, { status });
      setBlogs((current) => current.map((item) => item._id === blog._id ? response.blog : item));
      if (editing?._id === blog._id) {
        setEditing(response.blog);
        setForm((current) => ({ ...current, status }));
      }
      toast.success(`Blog ${status === "published" ? "published" : `marked ${status}`}.`);
    } catch (error) {
      toast.error(error.message || "Unable to change blog status.");
    }
  };

  const deleteBlog = async (blog) => {
    if (!window.confirm(`Delete “${blog.title}” permanently?`)) return;
    try {
      await api.deleteBlog(blog._id);
      setBlogs((current) => current.filter((item) => item._id !== blog._id));
      if (editing?._id === blog._id) setEditing(null);
      toast.success("Blog deleted.");
    } catch (error) {
      toast.error(error.message || "Unable to delete this blog.");
    }
  };

  const moveBlog = async (blog, direction) => {
    const index = blogs.findIndex((item) => item._id === blog._id);
    const target = index + direction;
    if (target < 0 || target >= blogs.length) return;
    const reordered = [...blogs];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setReordering(true);
    try {
      const response = await api.reorderBlogs(reordered.map((item) => item._id));
      setBlogs(response.blogs || reordered);
    } catch (error) {
      toast.error(error.message || "Unable to reorder blogs.");
    } finally {
      setReordering(false);
    }
  };

  const closeEditor = async () => {
    if (saving) return;
    if (dirty && editing) await saveChanges(form, editing);
    setEditing(null);
  };

  return (
    <div className="space-y-7">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--cc-primary)]">Administration</p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--cc-heading)]">Blogs management</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)]">
            Create and manage public blog posts. New posts are saved as drafts and edits autosave.
          </p>
        </div>
        <button type="button" disabled={creating} onClick={createDraft} className="inline-flex items-center gap-2 rounded-[var(--cc-radius-md)] bg-[var(--cc-primary)] px-4 py-2.5 text-sm font-medium text-[var(--cc-on-primary)] hover:bg-[var(--cc-primary-hover)] disabled:opacity-60">
          <Plus className="size-4" /> {creating ? "Creating draft…" : "Create blog"}
        </button>
      </section>

      <section className="overflow-hidden rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--cc-border)] p-4 sm:px-5">
          <div>
            <h2 className="font-semibold text-[var(--cc-heading)]">All blogs</h2>
            <p className="mt-1 text-xs text-[var(--cc-text-muted)]">Use the arrows to set the order shown on the public page.</p>
          </div>
          <select aria-label="Filter blogs by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-2 text-sm text-[var(--cc-text)]">
            <option value="all">All statuses</option>
            {STATUSES.map((status) => <option key={status} value={status}>{capitalize(status)}</option>)}
          </select>
        </div>

        {loading ? <div className="p-10 text-center text-sm text-[var(--cc-text-muted)]">Loading blogs…</div> : visibleBlogs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead><tr className="bg-[var(--cc-surface-subtle)]">
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">Blog</th>
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">Updated</th>
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">Status</th>
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">Order</th>
                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide text-[var(--cc-text-soft)]">Actions</th>
              </tr></thead>
              <tbody>
                {visibleBlogs.map((blog) => {
                  const allIndex = blogs.findIndex((item) => item._id === blog._id);
                  return <tr key={blog._id} className="border-t border-[var(--cc-border)]">
                    <td className="px-5 py-4"><p className="text-sm font-medium text-[var(--cc-heading)]">{blog.title || "Untitled blog"}</p><p className="mt-1 text-xs text-[var(--cc-text-muted)]">/blog/{blog.slug}</p></td>
                    <td className="px-5 py-4 text-sm text-[var(--cc-text-muted)]">{formatDate(blog.updated_at)}</td>
                    <td className="px-5 py-4"><select aria-label={`Status for ${blog.title}`} value={blog.status} onChange={(event) => changeStatus(blog, event.target.value)} className="rounded-full border border-[var(--cc-border)] bg-[var(--cc-surface)] px-2.5 py-1.5 text-xs capitalize text-[var(--cc-text)]">{STATUSES.map((status) => <option key={status} value={status}>{capitalize(status)}</option>)}</select></td>
                    <td className="px-5 py-4"><div className="flex gap-1"><button type="button" disabled={reordering || allIndex === 0} onClick={() => moveBlog(blog, -1)} aria-label={`Move ${blog.title} up`} className="rounded border border-[var(--cc-border)] p-1.5 text-[var(--cc-text-muted)] disabled:opacity-40"><ArrowUp className="size-4" /></button><button type="button" disabled={reordering || allIndex === blogs.length - 1} onClick={() => moveBlog(blog, 1)} aria-label={`Move ${blog.title} down`} className="rounded border border-[var(--cc-border)] p-1.5 text-[var(--cc-text-muted)] disabled:opacity-40"><ArrowDown className="size-4" /></button></div></td>
                    <td className="px-5 py-4"><div className="flex gap-2"><button type="button" onClick={() => openEditor(blog)} aria-label={`Edit ${blog.title}`} className="rounded border border-[var(--cc-border)] p-2 text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"><Pencil className="size-4" /></button><button type="button" onClick={() => deleteBlog(blog)} aria-label={`Delete ${blog.title}`} className="rounded border border-[var(--cc-border)] p-2 text-[var(--cc-danger)] hover:bg-[var(--cc-danger-soft)]"><Trash2 className="size-4" /></button></div></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        ) : <div className="p-10 text-center"><FileText className="mx-auto size-8 text-[var(--cc-text-soft)]" /><p className="mt-3 text-sm text-[var(--cc-text-muted)]">{blogs.length ? "No blogs match this status." : "No blogs yet. Create a draft to get started."}</p></div>}
      </section>

      {editing && <BlogEditor
        blog={editing}
        form={form}
        saving={saving}
        onChange={updateField}
        onClose={closeEditor}
      />}
    </div>
  );
}

function BlogEditor({ blog, form, saving, onChange, onClose }) {
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4" role="presentation">
    <section role="dialog" aria-modal="true" aria-labelledby="blog-editor-title" className="mx-auto my-6 max-w-4xl rounded-[var(--cc-radius-xl)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-md)]">
      <header className="flex items-center justify-between border-b border-[var(--cc-border)] px-5 py-4 sm:px-6">
        <div><h2 id="blog-editor-title" className="font-semibold text-[var(--cc-heading)]">{blog.title === "Untitled blog" ? "Create blog draft" : "Edit blog"}</h2><p className="mt-1 text-xs text-[var(--cc-text-muted)]">Changes save automatically · <span aria-live="polite">{saving ? "Saving…" : "Saved"}</span></p></div>
        <button type="button" onClick={onClose} aria-label="Close editor" className="rounded p-2 text-[var(--cc-text-muted)] hover:bg-[var(--cc-surface-subtle)]"><X className="size-4" /></button>
      </header>
      <div className="grid gap-5 p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Title" value={form.title} disabled={saving} onChange={(value) => onChange("title", value)} />
          <TextField label="URL slug" value={form.slug} disabled={saving} onChange={(value) => onChange("slug", value)} help="Used in the public blog URL." />
          <TextField label="Author" value={form.author} disabled={saving} onChange={(value) => onChange("author", value)} />
          <TextField label="Cover image URL" value={form.cover_image_url} type="url" disabled={saving} onChange={(value) => onChange("cover_image_url", value)} />
          <TextField label="Tags" value={form.tags} disabled={saving} onChange={(value) => onChange("tags", value)} help="Separate tags with commas." />
          <label className="block"><span className="text-sm font-medium text-[var(--cc-text)]">Status</span><select value={form.status} disabled={saving} onChange={(event) => onChange("status", event.target.value)} className="mt-1.5 w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-2.5 text-sm text-[var(--cc-text)]">{STATUSES.map((status) => <option key={status} value={status}>{capitalize(status)}</option>)}</select></label>
        </div>
        <TextArea label="Excerpt" value={form.excerpt} rows={3} disabled={saving} onChange={(value) => onChange("excerpt", value)} help="A short summary shown on the public blog listing." />
        <TextArea label="Blog content" value={form.content} rows={14} disabled={saving} onChange={(value) => onChange("content", value)} help="Plain text content. Line breaks are preserved on the public page." />
        <div className="flex justify-end border-t border-[var(--cc-border)] pt-4"><button type="button" onClick={onClose} className="rounded-[var(--cc-radius-md)] border border-[var(--cc-border)] px-4 py-2 text-sm font-medium text-[var(--cc-text)] hover:bg-[var(--cc-surface-subtle)]">Close</button></div>
      </div>
    </section>
  </div>;
}

function TextField({ label, value, onChange, type = "text", disabled = false, help }) {
  return <label className="block"><span className="text-sm font-medium text-[var(--cc-text)]">{label}</span><input type={type} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-2.5 text-sm text-[var(--cc-text)] outline-none focus:border-[var(--cc-focus)] disabled:opacity-60" />{help && <span className="mt-1 block text-xs text-[var(--cc-text-soft)]">{help}</span>}</label>;
}

function TextArea({ label, value, onChange, rows, disabled, help }) {
  return <label className="block"><span className="text-sm font-medium text-[var(--cc-text)]">{label}</span><textarea rows={rows} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full resize-y rounded-[var(--cc-radius-sm)] border border-[var(--cc-border)] bg-[var(--cc-surface)] px-3 py-2.5 text-sm leading-6 text-[var(--cc-text)] outline-none focus:border-[var(--cc-focus)] disabled:opacity-60" />{help && <span className="mt-1 block text-xs text-[var(--cc-text-soft)]">{help}</span>}</label>;
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled-blog";
}

function compareOrder(left, right) {
  return (left.display_order ?? 0) - (right.display_order ?? 0) || left.title.localeCompare(right.title);
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}
