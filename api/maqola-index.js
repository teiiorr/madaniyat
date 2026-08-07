// Server-rendered listing of every published article — this is the page
// Google Scholar's crawler follows to discover /maqola/<slug> pages, since it
// does not execute the JS on /#maqolalar.

import { createClient } from "@supabase/supabase-js";

const SITE = "madaniyat";
const SITE_ORIGIN = "https://juca.uz";
const JOURNAL_TITLE = "O'zbekiston madaniyati va san'ati";
const JOURNAL_TITLE_SHORT = "O'zMS jurnali";

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

function esc(s) {
    return String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default async function handler(req, res) {
    const { data, error } = await supabase
        .from("articles")
        .select("slug, title, authors, abstract, journal_year, journal_issue, published_at, language")
        .eq("site", SITE)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

    if (error) {
        res.status(500).send(`DB error: ${error.message}`);
        return;
    }

    const articles = data || [];

    const rows = articles.map((a) => {
        const authors = Array.isArray(a.authors) ? a.authors.map((au) => au.name).filter(Boolean).join(", ") : "";
        const issue = [a.journal_year, a.journal_issue && `${a.journal_issue}-son`].filter(Boolean).join(" · ");
        return `<article class="listing-item">
            <h2><a href="/maqola/${esc(encodeURIComponent(a.slug))}">${esc(a.title)}</a></h2>
            ${authors ? `<p class="authors">${esc(authors)}</p>` : ""}
            ${issue ? `<p class="issue">${esc(issue)}</p>` : ""}
            ${a.abstract ? `<p class="abstract">${esc(a.abstract.slice(0, 300))}${a.abstract.length > 300 ? "…" : ""}</p>` : ""}
        </article>`;
    }).join("\n");

    const html = `<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maqolalar — ${esc(JOURNAL_TITLE_SHORT)}</title>
    <meta name="description" content="${esc(JOURNAL_TITLE)} — chop etilgan ilmiy maqolalar ro'yxati.">
    <link rel="canonical" href="${SITE_ORIGIN}/maqola">
    <meta name="robots" content="index, follow">
    <link rel="icon" href="/assets/logo.png">
    <style>
        :root { color-scheme: light; }
        body { font-family: "Sora", "Onest", "Inter", system-ui, sans-serif; max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; color: #12131a; line-height: 1.6; background: #fafbfd; }
        .breadcrumb { font-size: 13px; color: #6a6f80; margin-bottom: 24px; }
        .breadcrumb a { color: #143a86; text-decoration: none; }
        h1 { font-size: 28px; margin: 0 0 8px; }
        .lead { color: #4a4e5a; margin: 0 0 28px; }
        .listing-item { padding: 20px 0; border-bottom: 1px solid #e4e6ee; }
        .listing-item h2 { font-size: 18px; margin: 0 0 8px; line-height: 1.35; }
        .listing-item h2 a { color: #12131a; text-decoration: none; }
        .listing-item h2 a:hover { color: #143a86; text-decoration: underline; }
        .listing-item .authors { font-style: italic; color: #4a4e5a; margin: 0 0 4px; font-size: 14px; }
        .listing-item .issue { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #143a86; margin: 0 0 8px; font-weight: 600; }
        .listing-item .abstract { color: #4a4e5a; margin: 0; font-size: 14px; }
        .empty { color: #6a6f80; padding: 40px 0; text-align: center; }
    </style>
</head>
<body>
    <nav class="breadcrumb">
        <a href="/">${esc(JOURNAL_TITLE_SHORT)}</a> › <span>Maqolalar</span>
    </nav>
    <h1>Maqolalar</h1>
    <p class="lead">${esc(JOURNAL_TITLE)} — chop etilgan barcha ilmiy maqolalar.</p>
    ${articles.length ? rows : `<div class="empty">Hozircha maqolalar yo'q.</div>`}
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    res.status(200).send(html);
}
