// Server-rendered listing of every published article — this is the page
// Google Scholar's crawler follows to discover /maqola/<slug> pages, since it
// does not execute the JS on /#maqolalar.

import { createClient } from "@supabase/supabase-js";

const SITE = "madaniyat";
const SITE_ORIGIN = "https://juca.uz";
const JOURNAL_TITLE = "O'zbekiston madaniyati va san'ati";
const JOURNAL_TITLE_SHORT = "O'zMS jurnali";
const ISSN = "3093-8597";

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

function esc(s) {
    return String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const STYLES = `
    :root {
        color-scheme: light;
        --page-bg: #0a2038;
        --rail: #0a2038;
        --rail-2: #0d2746;
        --paper: #f7f3ea;
        --paper-2: #fefcf7;
        --text: #25303f;
        --ink: #122039;
        --muted: #6a7382;
        --line: #e6dcc9;
        --line-soft: #efe7d6;
        --panel: #ffffff;
        --navy: #143a6b;
        --navy-dark: #0d2a4a;
        --navy-deep: #08203d;
        --gold: #c9a13e;
        --gold-light: #e6c462;
        --gold-deep: #9b7a25;
        --gold-soft: #f4e7c0;
        --rail-text: #eae3d3;
        --rail-muted: #8da3c2;
        --rail-line: rgba(255, 255, 255, 0.12);
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body {
        background: var(--page-bg);
        color: var(--text);
        font-family: "Onest", system-ui, -apple-system, sans-serif;
        line-height: 1.65;
        min-height: 100vh;
    }
    a { color: var(--navy); }

    .ms-shell {
        display: grid;
        grid-template-columns: 260px 1fr;
        min-height: 100vh;
    }
    @media (max-width: 900px) { .ms-shell { grid-template-columns: 1fr; } }

    .rail {
        background: var(--rail);
        color: var(--rail-text);
        padding: 36px 26px;
        display: flex;
        flex-direction: column;
        gap: 26px;
        border-right: 1px solid var(--rail-line);
    }
    @media (max-width: 900px) { .rail { padding: 20px; } }

    .rail-brand {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        text-decoration: none;
        color: inherit;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--rail-line);
    }
    .rail-brand img { width: 44px; height: 44px; object-fit: contain; filter: brightness(0) invert(1); opacity: 0.9; }
    .rail-brand strong { font-family: "Sora", system-ui, sans-serif; font-size: 15px; font-weight: 700; letter-spacing: -0.01em; display: block; line-height: 1.3; }
    .rail-brand em { font-style: normal; font-size: 11.5px; color: var(--rail-muted); text-transform: uppercase; letter-spacing: 0.07em; display: block; margin-top: 4px; }

    .rail-nav { display: flex; flex-direction: column; gap: 4px; }
    .rail-nav a {
        display: flex; align-items: center; gap: 12px;
        padding: 10px 12px;
        color: var(--rail-text);
        text-decoration: none;
        font-size: 14px;
        border-radius: 4px;
        transition: background 0.2s, color 0.2s;
    }
    .rail-nav a:hover { background: var(--rail-2); color: #fff; }
    .rail-nav a.is-current { background: var(--rail-2); color: var(--gold-light); }
    .rail-nav a .num { color: var(--gold); font-size: 11px; font-weight: 700; letter-spacing: 0.08em; min-width: 22px; }

    .rail-foot {
        margin-top: auto;
        padding-top: 20px;
        border-top: 1px solid var(--rail-line);
        display: flex;
        flex-direction: column;
        gap: 10px;
        font-size: 12px;
        color: var(--rail-muted);
    }
    .rail-cta {
        display: inline-block;
        padding: 10px 16px;
        background: var(--gold);
        color: var(--navy-deep) !important;
        border-radius: 4px;
        text-decoration: none;
        font-weight: 700;
        font-size: 13px;
        text-align: center;
        transition: background 0.2s;
    }
    .rail-cta:hover { background: var(--gold-light); }

    .main {
        background: var(--paper);
        padding: 48px 56px 64px;
        min-height: 100vh;
    }
    @media (max-width: 900px) { .main { padding: 32px 22px 48px; } }

    .breadcrumb {
        display: flex; flex-wrap: wrap; gap: 8px;
        font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;
        color: var(--muted); margin-bottom: 22px;
    }
    .breadcrumb a { color: var(--muted); text-decoration: none; }
    .breadcrumb a:hover { color: var(--navy); }
    .breadcrumb strong { color: var(--navy); }

    .sec-head {
        display: flex; align-items: baseline; gap: 20px;
        padding-bottom: 22px;
        border-bottom: 1px solid var(--line);
        margin-bottom: 30px;
    }
    .sec-num {
        font-family: "Sora", system-ui, sans-serif;
        font-size: 44px; font-weight: 700;
        color: var(--gold);
        letter-spacing: -0.02em;
        line-height: 1;
    }
    .sec-title {
        font-family: "Sora", system-ui, sans-serif;
        font-size: clamp(28px, 3vw, 40px);
        font-weight: 700;
        margin: 0;
        color: var(--ink);
        letter-spacing: -0.02em;
    }
    .sec-lead {
        color: var(--muted);
        font-size: 15.5px;
        max-width: 68ch;
        margin: 0 0 32px;
    }

    .articles-list { display: grid; gap: 16px; }
    .listing-item {
        padding: 24px 26px;
        background: var(--paper-2);
        border: 1px solid var(--line);
        border-radius: 6px;
        transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }
    .listing-item:hover {
        transform: translateY(-2px);
        border-color: var(--gold);
        box-shadow: 0 14px 34px rgba(8, 26, 48, 0.12);
    }
    .listing-item .issue-badge {
        display: inline-block;
        padding: 3px 10px;
        background: var(--navy-deep);
        color: var(--gold-light);
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: 700;
        border-radius: 3px;
        margin-bottom: 10px;
    }
    .listing-item h2 {
        font-family: "Sora", system-ui, sans-serif;
        font-size: 20px;
        line-height: 1.3;
        margin: 0 0 10px;
        font-weight: 600;
        letter-spacing: -0.005em;
    }
    .listing-item h2 a { color: var(--ink); text-decoration: none; }
    .listing-item h2 a:hover { color: var(--navy); text-decoration: underline; text-decoration-color: var(--gold); text-underline-offset: 4px; }
    .listing-item .authors { font-style: italic; color: var(--text); margin: 0 0 10px; font-size: 14px; }
    .listing-item .abstract { color: var(--muted); font-size: 14px; margin: 0; line-height: 1.6; }

    .empty {
        padding: 60px 20px;
        text-align: center;
        color: var(--muted);
        background: var(--paper-2);
        border: 1px dashed var(--line);
        border-radius: 6px;
    }
    .empty h3 { font-family: "Sora", system-ui, sans-serif; margin: 0 0 8px; color: var(--ink); }

    .foot-note {
        margin-top: 48px;
        padding-top: 24px;
        border-top: 1px solid var(--line);
        font-size: 12px;
        color: var(--muted);
    }
    .foot-note a { color: inherit; text-decoration: underline; text-underline-offset: 3px; }
`;

export default async function handler(req, res) {
    const { data, error } = await supabase
        .from("articles")
        .select("slug, title, authors, abstract, journal_year, journal_issue, published_at, language, first_page, last_page")
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
        const pages = a.first_page ? `${a.first_page}${a.last_page ? "–" + a.last_page : ""}-bet` : "";
        const meta = [issue, pages].filter(Boolean).join(" · ");
        return `<article class="listing-item">
            ${meta ? `<span class="issue-badge">${esc(meta)}</span>` : ""}
            <h2><a href="/maqola/${esc(encodeURIComponent(a.slug))}">${esc(a.title)}</a></h2>
            ${authors ? `<p class="authors">${esc(authors)}</p>` : ""}
            ${a.abstract ? `<p class="abstract">${esc(a.abstract.slice(0, 280))}${a.abstract.length > 280 ? "…" : ""}</p>` : ""}
        </article>`;
    }).join("\n");

    const html = `<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maqolalar — ${esc(JOURNAL_TITLE_SHORT)}</title>
    <meta name="description" content="${esc(JOURNAL_TITLE)} — chop etilgan barcha ilmiy maqolalar. ISSN ${ISSN}.">
    <link rel="canonical" href="${SITE_ORIGIN}/maqola">
    <meta name="robots" content="index, follow">
    <link rel="icon" href="/assets/logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>${STYLES}</style>
</head>
<body>
    <div class="ms-shell">
        <aside class="rail">
            <a class="rail-brand" href="/">
                <img src="/assets/logo.png" alt="">
                <span>
                    <strong>O'zbekiston madaniyati<br>va san'ati</strong>
                    <em>Ilmiy elektron jurnal</em>
                </span>
            </a>

            <nav class="rail-nav">
                <a href="/#haqida"><span class="num">01</span> Jurnal haqida</a>
                <a href="/#maqsad"><span class="num">02</span> Maqsad va ruknlar</a>
                <a href="/#talablar"><span class="num">03</span> Mualliflarga</a>
                <a href="/#tahririyat"><span class="num">04</span> Tahririyat</a>
                <a href="/#arxiv"><span class="num">05</span> Arxiv</a>
                <a href="/maqola" class="is-current"><span class="num">06</span> Maqolalar</a>
                <a href="/#aloqa"><span class="num">07</span> Aloqa</a>
            </nav>

            <div class="rail-foot">
                <a class="rail-cta" href="/#aloqa">Maqola yuborish</a>
                <p style="margin:0;">OAK ro'yxati · 2025-yil 31-oktabr<br>№376/5 · san'atshunoslik</p>
            </div>
        </aside>

        <main class="main">
            <nav class="breadcrumb" aria-label="Breadcrumb">
                <a href="/">Asosiy sahifa</a>
                <span>/</span>
                <strong>Maqolalar</strong>
            </nav>

            <header class="sec-head">
                <span class="sec-num">06</span>
                <h1 class="sec-title">Maqolalar</h1>
            </header>

            <p class="sec-lead">${esc(JOURNAL_TITLE)} — chop etilgan barcha ilmiy maqolalar. Har bir maqola alohida sahifada, to'liq metama'lumot va PDF matn bilan.</p>

            ${articles.length
                ? `<div class="articles-list">${rows}</div>`
                : `<div class="empty"><h3>Maqolalar hali qo'shilmagan</h3><p>Yangi sonlar tez orada shu yerda paydo bo'ladi.</p></div>`}

            <p class="foot-note">© «${esc(JOURNAL_TITLE)}» elektron jurnali. Designed &amp; developed by <a href="https://teiior.uz" target="_blank" rel="noopener noreferrer">teiior</a></p>
        </main>
    </div>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    res.status(200).send(html);
}
