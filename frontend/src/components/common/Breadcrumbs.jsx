import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Breadcrumbs({ items = [], current }) {
  const crumbs = [...items, { label: current }];
  const origin = (
    import.meta.env.VITE_SITE_URL || window.location.origin
  ).replace(/\/+$/, "");
  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: crumb.to ? new URL(crumb.to, origin).href : undefined,
    })),
  });

  useEffect(() => {
    document.head
      .querySelectorAll("[data-campusconnect-breadcrumb]")
      .forEach((node) => node.remove());

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.campusconnectBreadcrumb = "true";
    script.textContent = schemaJson.replace(/</g, "\\u003c");
    document.head.append(script);
    return () => script.remove();
  }, [schemaJson]);

  return (
    <nav className="container-page pt-7 text-sm" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-[var(--cc-text-muted)]">
        {crumbs.map((crumb, index) => (
          <li key={crumb.label + "-" + index} className="inline-flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">/</span>}
            {crumb.to
              ? <Link to={crumb.to} className="hover:text-[var(--cc-primary)] hover:underline">{crumb.label}</Link>
              : <span aria-current="page" className="font-medium text-[var(--cc-heading)]">{crumb.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
