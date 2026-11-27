# Milestone I Keyword-to-Page Map

This map carries the supplied Milestone I keyword strategy into the current React/Vite project and Milestone II work. Give each search intent one primary URL to reduce overlap between pages.

| Page | Primary keyword | Supporting terms from Milestone I | Intent | Local implementation status |
|---|---|---|---|---|
| Home `/` | college tech events in India | college technology events; university technology events | Informational / discovery | Homepage title and description target the primary phrase; the page links to events, clubs and the blog. |
| Events `/events` | technical events for college students | student technology events in India | Informational / discovery | Public event listing and metadata are present. |
| Hackathons `/hackathons` | college hackathons in India | hackathon India; student hackathons in India; upcoming hackathons in India | Informational / discovery | Dedicated filtered route, title, description and category links are present. |
| Workshops `/workshops` | AI workshops for college students | AI workshops for students; technical workshops for college students | Informational | Dedicated filtered route and metadata are present. |
| Competitions `/competitions` | coding competitions for college students | coding competition in India; coding competitions for engineering students | Informational / discovery | Dedicated filtered route and metadata are present. |
| Tech clubs `/clubs` | university tech clubs | college technology clubs | Informational | Public clubs page and metadata are present. |
| Individual event `/events/{slug}` | event-specific keyword | event type + university/location | Informational / transactional | Dynamic route and Event JSON-LD are present when event data supports it; server-rendered metadata still needs deployment-time validation. |
| Blog `/blog` | student technology guides | hackathon guides; coding competition guides | Informational | Blog collection page and metadata are present. |
| Hackathon guide `/blog/how-to-prepare-for-a-hackathon` | how to prepare for a hackathon | hackathon preparation tips | Informational | Original article draft is ready under this folder; it links to `/hackathons` and still needs publication through the admin editor. |

## Keyword ownership rules

- Keep “college hackathons in India” focused on `/hackathons`; use the guide for preparation advice rather than making it another general event listing.
- Keep workshop, competition and tech-club phrases on their dedicated pages. Link between them where relevant, but do not copy the same primary keyword and page copy across all categories.
- Use specific event titles, locations, dates and eligibility on event detail pages. Keep `/events` as the broad event-discovery hub.
- Use one stable canonical hostname: `https://campusconect.online` (preserve the domain's spelling).

## Research freshness

Milestone I contains KWFinder volume and difficulty snapshots, SERP observations and Unstop/Devpost metrics. Those values are historical inputs, not current performance claims. Refresh volume, difficulty, rankings, competitor backlinks and SERP features with the same tool, location and date recorded before presenting them as current findings. The current code work does not prove rankings, search traffic or indexing.
