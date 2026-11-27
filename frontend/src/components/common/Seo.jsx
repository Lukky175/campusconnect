import { useEffect } from "react";

const DEFAULT_IMAGE = "/Bennett_2.webp";

export default function Seo({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
  schema,
  robots = "index,follow",
}) {
  const schemaJson = JSON.stringify(schema ?? null);

  useEffect(() => {
    const origin = (
      import.meta.env.VITE_SITE_URL || window.location.origin
    ).replace(/\/+$/, "");
    const canonicalUrl = new URL(path || window.location.pathname, origin).href;
    const pageTitle = title ? title + " | CampusConnect" : "CampusConnect";
    const imageUrl = image ? new URL(image, origin).href : "";

    document.title = pageTitle;
    setMeta("name", "description", description || "");
    setMeta("name", "robots", robots);
    setMeta("property", "og:site_name", "CampusConnect");
    setMeta("property", "og:type", type);
    setMeta("property", "og:title", pageTitle);
    setMeta("property", "og:description", description || "");
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", imageUrl);
    setMeta("name", "twitter:card", imageUrl ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", pageTitle);
    setMeta("name", "twitter:description", description || "");
    setMeta("name", "twitter:image", imageUrl);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl;

    document.head
      .querySelectorAll("[data-campusconnect-schema]")
      .forEach((node) => node.remove());

    const schemaValue = JSON.parse(schemaJson);
    const entries = (Array.isArray(schemaValue) ? schemaValue : [schemaValue]).filter(Boolean);
    if (entries.length) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.campusconnectSchema = "true";
      const payload = entries.length === 1
        ? entries[0]
        : { "@context": "https://schema.org", "@graph": entries };
      script.textContent = JSON.stringify(payload).replace(/</g, "\\u003c");
      document.head.append(script);
    }
  }, [description, image, path, robots, schemaJson, title, type]);

  return null;
}

function setMeta(attribute, name, content) {
  const selector = 'meta[' + attribute + '="' + name + '"]';
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.append(element);
  }
  element.content = content;
}
