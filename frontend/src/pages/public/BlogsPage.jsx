import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import EmptyState from "../../components/common/EmptyState";
import { api } from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const toast = useToast();

  useEffect(() => {
    let active = true;
    api.getBlogs()
      .then((response) => {
        if (active) setBlogs(response.blogs || []);
      })
      .catch((error) => {
        if (active) toast.error(error.message || "Unable to load blogs.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [toast]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredBlogs = blogs.filter((blog) => [blog.title, blog.excerpt, ...(blog.tags || [])]
    .filter(Boolean).join(" ").toLowerCase().includes(normalizedQuery));

  return <PublicLayout>
    <section className="border-b border-[var(--cc-border)] bg-[var(--cc-surface-subtle)]">
      <div className="container-page py-14 md:py-20">
        <p className="text-sm font-medium text-[var(--cc-primary)]">CampusConnect journal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--cc-heading)] sm:text-4xl">Ideas, guides and campus stories.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--cc-text-muted)] sm:text-base">Read practical technology guides and stories shared with the CampusConnect community.</p>
        <label className="relative mt-7 block max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--cc-text-soft)]" />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search blogs and tags…" aria-label="Search blogs" className="h-11 w-full rounded-[var(--cc-radius-md)] border border-[var(--cc-border)] bg-[var(--cc-surface)] pl-10 pr-4 text-sm text-[var(--cc-text)] outline-none focus:border-[var(--cc-focus)]" />
        </label>
      </div>
    </section>
    <section className="container-page py-10 md:py-14">
      {loading ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)]" />)}</div>
        : filteredBlogs.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.map((blog) => <article key={blog._id} className="flex h-full flex-col overflow-hidden rounded-[var(--cc-radius-lg)] border border-[var(--cc-border)] bg-[var(--cc-surface)] shadow-[var(--cc-shadow-sm)]">
            {blog.cover_image_url ? <img src={blog.cover_image_url} alt="" loading="lazy" className="h-48 w-full object-cover" /> : <div className="flex h-40 items-center justify-center bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><BookOpen className="size-8" /></div>}
            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs text-[var(--cc-text-soft)]">{formatDate(blog.published_at)}{blog.author ? ` · ${blog.author}` : ""}</p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-[var(--cc-heading)]">{blog.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--cc-text-muted)]">{blog.excerpt}</p>
              {blog.tags?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{blog.tags.map((tag) => <span key={tag} className="rounded-full bg-[var(--cc-surface-subtle)] px-2.5 py-1 text-xs text-[var(--cc-text-muted)]">{tag}</span>)}</div>}
              <Link to={`/blog/${encodeURIComponent(blog.slug)}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-medium text-[var(--cc-primary)] hover:underline">Read article <ArrowRight className="size-4" /></Link>
            </div>
          </article>)}
        </div> : <EmptyState title={blogs.length ? "No matching blogs" : "No blogs published yet"} description={blogs.length ? "Try another search term." : "New articles will appear here when they are published."} />}
    </section>
  </PublicLayout>;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}
