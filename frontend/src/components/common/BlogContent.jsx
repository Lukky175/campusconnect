import { Fragment } from "react";
import { Link } from "react-router-dom";

export default function BlogContent({ content = "" }) {
  const lines = String(content).replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      blocks.push({
        type: heading[1].length === 2 ? "h2" : "h3",
        text: heading[2],
      });
      index += 1;
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/);
    if (unordered) {
      const items = [];
      while (index < lines.length) {
        const match = lines[index].trim().match(/^[-*]\s+(.+)$/);
        if (!match) break;
        items.push(match[1]);
        index += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.+)$/);
    if (ordered) {
      const items = [];
      while (index < lines.length) {
        const match = lines[index].trim().match(/^\d+\.\s+(.+)$/);
        if (!match) break;
        items.push(match[1]);
        index += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      if (/^(#{2,3})\s+|^[-*]\s+|^\d+\.\s+/.test(lines[index].trim())) break;
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: "p", text: paragraph.join(" ") });
  }

  return (
    <div className="prose-campus mt-8 space-y-5 text-sm leading-7 text-[var(--cc-text)]">
      {blocks.map((block, blockIndex) => {
        if (block.type === "h2") {
          return <h2 key={blockIndex} className="pt-3 text-2xl font-semibold tracking-tight text-[var(--cc-heading)]">{renderInline(block.text, blockIndex)}</h2>;
        }
        if (block.type === "h3") {
          return <h3 key={blockIndex} className="pt-2 text-lg font-semibold text-[var(--cc-heading)]">{renderInline(block.text, blockIndex)}</h3>;
        }
        if (block.type === "ul" || block.type === "ol") {
          const List = block.type;
          return <List key={blockIndex} className="list-inside space-y-2 pl-3">
            {block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, blockIndex + "-" + itemIndex)}</li>)}
          </List>;
        }
        return <p key={blockIndex}>{renderInline(block.text, blockIndex)}</p>;
      })}
    </div>
  );
}

function renderInline(text, keyPrefix) {
  const linkPattern = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  const elements = [];
  let lastIndex = 0;
  let match;
  let linkIndex = 0;

  while ((match = linkPattern.exec(text))) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    const [, label, rawHref] = match;
    if (rawHref.startsWith("/") && !rawHref.startsWith("//")) {
      elements.push(<Link key={keyPrefix + "-" + linkIndex} to={rawHref} className="font-medium text-[var(--cc-primary)] underline underline-offset-2">{label}</Link>);
    } else {
      const href = safeExternalHref(rawHref);
      elements.push(href
        ? <a key={keyPrefix + "-" + linkIndex} href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--cc-primary)] underline underline-offset-2">{label}</a>
        : match[0]);
    }
    lastIndex = linkPattern.lastIndex;
    linkIndex += 1;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }
  return elements.map((element, index) => (
    <Fragment key={typeof element === "string" ? keyPrefix + "-text-" + index : element.key}>
      {element}
    </Fragment>
  ));
}

function safeExternalHref(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}
