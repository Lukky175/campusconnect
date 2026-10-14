import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PublicLayout from "../../components/layout/PublicLayout";
import { api } from "../../services/api";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    api.getBlog(slug)
      .then((response) => { if (active) setBlog(response.blog || null); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  return <PublicLayout>
    <article className="container-page py-10 md:py-16">
      <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-[var(--cc-text-muted)] hover:text-[var(--cc-primary)]"><ArrowLeft className="size-4" />All blogs</Link>
      {loading ? <div className="mx-auto mt-10 max-w-3xl animate-pulse"><div className="h-8 w-2/3 rounded bg-[var(--cc-surface-subtle)]" /><div className="mt-6 h-80 rounded-[var(--cc-radius-lg)] bg-[var(--cc-surface-subtle)]" /></div>
        : error || !blog ? <div className="py-20 text-center"><h1 className="text-2xl font-semibold text-[var(--cc-heading)]">Blog not found</h1><p className="mt-2 text-sm text-[var(--cc-text-muted)]">This article may have been unpublished or removed.</p><Link to="/blog" className="mt-5 inline-block text-sm font-medium text-[var(--cc-primary)] hover:underline">Back to blogs</Link></div>
          : <div className="mx-auto mt-8 max-w-3xl">
            <div className="flex flex-wrap gap-2">{blog.tags?.map((tag) => <span key={tag} className="rounded-full bg-[var(--cc-primary-soft)] px-2.5 py-1 text-xs font-medium text-[var(--cc-primary)]">{tag}</span>)}</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--cc-heading)] sm:text-4xl">{blog.title}</h1>
            <p className="mt-4 text-base leading-7 text-[var(--cc-text-muted)]">{blog.excerpt}</p>
            <p className="mt-4 text-sm text-[var(--cc-text-soft)]">{formatDate(blog.published_at)}{blog.author ? ` · ${blog.author}` : ""}</p>
            {blog.cover_image_url ? <img src={blog.cover_image_url} alt="" className="mt-8 max-h-[520px] w-full rounded-[var(--cc-radius-lg)] object-cover" /> : <div className="mt-8 flex h-48 items-center justify-center rounded-[var(--cc-radius-lg)] bg-[var(--cc-primary-soft)] text-[var(--cc-primary)]"><BookOpen className="size-9" /></div>}
            <div className="mt-8 whitespace-pre-wrap text-sm leading-7 text-[var(--cc-text)]">{blog.content}</div>
          </div>}
    </article>
  </PublicLayout>;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}
