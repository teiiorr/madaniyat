// Server-rendered listing of every published article — this is the page
// Google Scholar's crawler follows to discover /maqola/<slug> pages, since it
// does not execute the JS on /#maqolalar.

import { createClient } from "@supabase/supabase-js";

const SITE = "madaniyat";
const SITE_ORIGIN = "https://juca.uz";
const JOURNAL_TITLE = "O'zbekiston madaniyati va san'ati";
const JOURNAL_TITLE_SHORT = "O'zMS jurnali";
const ISSN = "3093-8597";
const PUBLISHER = "O'zbekiston davlat san'at va madaniyat instituti";

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
        --paper: #fbf8f0;
        --paper-2: #f6f0e2;
        --ink: #14192a;
        --ink-2: #1f273b;
        --muted: #6a7382;
        --hair: #dfd5be;
        --navy: #143a6b;
        --navy-dark: #0d2a4a;
        --navy-deep: #08203d;
        --gold: #a8842f;
        --gold-deep: #7f6323;
        --footer-bg: #08203d;
        --footer-text: #ffffff;
        --serif: "Source Serif 4", "Source Serif Pro", "Georgia", serif;
        --sans: "Sora", system-ui, -apple-system, sans-serif;
    }
    :root[data-theme="dark"] {
        color-scheme: dark;
        --paper: #0a0e1a;
        --paper-2: #12172a;
        --ink: #e8ecf5;
        --ink-2: #d0d5e2;
        --muted: #8892a3;
        --hair: #26304a;
        --navy: #7ba8db;
        --navy-dark: #5f8fc5;
        --gold: #d4a952;
        --gold-deep: #b48a3e;
        --footer-bg: #050810;
        --footer-text: #ffffff;
    }
    :root[data-theme="dark"] body { background: var(--paper); color: var(--ink-2); }
    :root[data-theme="dark"] .search-bar input,
    :root[data-theme="dark"] .search-bar select {
        background-color: var(--paper-2);
        color: var(--ink-2);
        border-color: var(--hair);
    }
    :root[data-theme="dark"] .search-bar select {
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='%238892a3' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>");
    }
    :root[data-theme="dark"] .theme-toggle .sun { display: inline; }
    :root[data-theme="dark"] .theme-toggle .moon { display: none; }
    .theme-toggle .sun { display: none; }
    .theme-toggle .moon { display: inline; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
        background: var(--paper);
        color: var(--ink-2);
        font-family: var(--serif);
        font-size: 17px;
        line-height: 1.7;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
    }

    .masthead {
        background: var(--paper);
        border-bottom: 1px solid var(--hair);
        padding: 1.25rem 2rem 1rem;
    }
    .masthead-inner {
        max-width: 1180px; margin: 0 auto;
        display: flex; align-items: center; justify-content: space-between;
        gap: 1rem; flex-wrap: wrap;
    }
    .masthead a.brand { display: flex; align-items: center; gap: 0.875rem; text-decoration: none; color: inherit; }
    .masthead img { width: 42px; height: 42px; opacity: 0.9; }
    .brand-title { font-family: var(--serif); font-weight: 600; font-size: 1.0625rem; color: var(--ink); display: block; line-height: 1.2; }
    .brand-sub { font-family: var(--sans); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.14em; color: var(--muted); display: block; margin-top: 4px; max-width: 46ch; }
    .masthead-meta { font-family: var(--sans); font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.14em; color: var(--muted); }

    .top-nav {
        background: var(--paper);
        border-bottom: 1px solid var(--hair);
        position: sticky; top: 0; z-index: 10;
    }
    .top-nav-inner {
        max-width: 1180px; margin: 0 auto;
        display: flex; flex-wrap: wrap;
        justify-content: center; position: relative;
    }
    .theme-toggle {
        position: absolute; right: 1rem; top: 50%;
        transform: translateY(-50%);
        background: transparent; border: 1px solid var(--hair);
        border-radius: 999px;
        padding: 0.375rem 0.625rem;
        cursor: pointer; color: var(--muted);
        font-size: 0.875rem; line-height: 1;
        transition: color 0.2s, border-color 0.2s;
        display: inline-flex; align-items: center; justify-content: center;
        min-width: 2rem; min-height: 2rem;
    }
    .theme-toggle:hover { color: var(--navy); border-color: var(--navy); }
    @media (max-width: 720px) {
        .theme-toggle { position: relative; right: auto; top: auto; transform: none; margin: 0.5rem; }
    }
    .top-nav a {
        display: inline-flex; align-items: center; justify-content: center;
        padding: 1rem 1.5rem;
        color: var(--ink-2);
        font-family: var(--sans);
        font-size: 0.75rem; font-weight: 600;
        letter-spacing: 0.14em; text-transform: uppercase;
        text-decoration: none;
        transition: color 0.2s;
        position: relative;
    }
    .top-nav a:hover { color: var(--navy); }
    .top-nav a.is-current { color: var(--navy); }
    .top-nav a.is-current::after {
        content: ""; position: absolute; left: 1.5rem; right: 1.5rem; bottom: -1px;
        height: 2px; background: var(--navy);
    }

    .page-head { max-width: 960px; margin: 0 auto; padding: 4rem 1.5rem 2.5rem; }
    .breadcrumb {
        display: flex; flex-wrap: wrap; gap: 0.4375rem;
        font-family: var(--sans);
        font-size: 0.6875rem; font-weight: 600;
        letter-spacing: 0.13em; text-transform: uppercase;
        color: var(--muted); margin-bottom: 2rem;
    }
    .breadcrumb a { color: var(--muted); text-decoration: none; }
    .breadcrumb a:hover { color: var(--navy); }
    .breadcrumb strong { color: var(--ink-2); font-weight: 700; }
    .breadcrumb span.sep { opacity: 0.45; }

    .page-eyebrow {
        font-family: var(--sans);
        font-size: 0.75rem;
        text-transform: uppercase; letter-spacing: 0.16em;
        color: var(--navy); font-weight: 600;
        margin-bottom: 1rem;
    }
    h1.page-title {
        font-family: var(--serif); font-weight: 600;
        font-size: clamp(2rem, 4vw, 3rem);
        line-height: 1.1; letter-spacing: -0.015em;
        color: var(--ink); margin: 0 0 0.75rem;
    }
    .page-lead {
        font-family: var(--serif);
        font-size: 1.125rem; line-height: 1.65;
        color: var(--muted);
        max-width: 60ch; margin: 0;
    }

    .listing-wrap { max-width: 960px; margin: 0 auto; padding: 1rem 1.5rem 5rem; }

    .search-bar {
        display: grid;
        grid-template-columns: 1fr minmax(220px, 280px) auto;
        align-items: center;
        gap: 0.875rem;
        margin: 0 0 2.5rem;
        padding: 1rem 0;
        border-top: 1px solid var(--hair);
        border-bottom: 1px solid var(--hair);
    }
    @media (max-width: 720px) {
        .search-bar { grid-template-columns: 1fr; }
        .search-bar .search-count { text-align: left; }
    }
    .search-bar input, .search-bar select {
        padding: 0.625rem 0.875rem;
        border: 1px solid var(--hair);
        border-radius: 2px;
        font-family: var(--sans);
        font-size: 0.875rem;
        background: #fff; color: var(--ink-2);
        transition: border-color 0.15s, box-shadow 0.15s;
        width: 100%;
    }
    .search-bar select {
        appearance: none;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='%236a7382' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>");
        background-repeat: no-repeat;
        background-position: right 12px center;
        padding-right: 34px;
        cursor: pointer;
    }
    .search-bar input:focus, .search-bar select:focus {
        outline: none; border-color: var(--navy);
        box-shadow: 0 0 0 3px rgba(20, 58, 107, 0.12);
    }
    .search-bar .search-count {
        font-family: var(--sans);
        font-size: 0.75rem; color: var(--muted);
        font-weight: 500; letter-spacing: 0.04em;
        min-width: 120px; text-align: right; padding: 0 0.375rem;
    }

    .articles-list { display: flex; flex-direction: column; }
    .listing-item {
        padding: 2rem 0;
        border-bottom: 1px solid var(--hair);
        display: grid;
        grid-template-columns: 5rem 1fr;
        gap: 1.5rem;
    }
    .listing-item:first-child { padding-top: 1rem; }
    @media (max-width: 640px) { .listing-item { grid-template-columns: 1fr; gap: 0.5rem; } }

    .listing-item .item-meta {
        font-family: var(--sans);
        font-size: 0.6875rem;
        text-transform: uppercase; letter-spacing: 0.13em;
        color: var(--muted); line-height: 1.5;
        padding-top: 0.375rem;
    }
    .listing-item .item-meta .year { display: block; font-weight: 700; color: var(--ink-2); font-size: 0.8125rem; letter-spacing: 0.06em; }
    .listing-item .item-meta .issue { display: block; margin-top: 2px; }
    .listing-item .item-meta .pages { display: block; margin-top: 2px; color: var(--gold-deep); font-weight: 600; }

    .listing-item h2 {
        font-family: var(--serif);
        font-size: 1.4375rem; line-height: 1.28;
        margin: 0 0 0.5rem;
        font-weight: 600; letter-spacing: -0.005em;
    }
    .listing-item h2 a { color: var(--ink); text-decoration: none; transition: color 0.15s; }
    .listing-item h2 a:hover { color: var(--navy); }
    .listing-item .authors {
        font-family: var(--serif); font-style: italic;
        color: var(--muted); margin: 0 0 0.75rem; font-size: 0.9375rem;
    }
    .listing-item .abstract {
        font-family: var(--serif);
        color: var(--ink-2);
        font-size: 1rem; margin: 0;
        line-height: 1.7;
        text-align: justify; hyphens: auto;
    }

    .empty, .search-no-results {
        padding: 3rem 0; text-align: center;
        color: var(--muted); font-family: var(--serif);
    }
    .empty h3, .search-no-results strong {
        display: block; font-family: var(--serif); font-weight: 600;
        color: var(--ink); margin-bottom: 0.5rem; font-size: 1.125rem;
    }
    .search-no-results { display: none; }
    .search-no-results.is-visible { display: block; }
    .search-no-results p { font-family: var(--sans); font-size: 0.875rem; margin: 0; }

    .site-footer {
        background: var(--footer-bg);
        padding: 1.5rem 2rem;
        margin-top: 4rem;
    }
    .footer-inner {
        max-width: 1180px; margin: 0 auto;
        display: flex; justify-content: space-between; align-items: center;
        flex-wrap: wrap; gap: 1rem;
        font-family: var(--sans);
        font-size: 0.8125rem; letter-spacing: 0.04em;
        color: var(--footer-text); font-weight: 700;
    }
    .footer-inner .footer-copy { font-weight: 500; opacity: 0.7; }
    .footer-inner a {
        color: var(--footer-text);
        font-weight: 700;
        text-decoration: underline; text-underline-offset: 3px;
        transition: color 0.2s;
    }
    .footer-inner a:hover { color: var(--gold); }

    @media (max-width: 720px) {
        body { font-size: 16px; }
        .page-head { padding: 2.5rem 1.25rem 2rem; }
        .listing-wrap { padding: 1rem 1.25rem 3rem; }
        .top-nav a { padding: 0.875rem 0.875rem; font-size: 0.6875rem; letter-spacing: 0.1em; }
        .top-nav-inner { justify-content: flex-start; overflow-x: auto; }
        .masthead { padding: 1rem 1.25rem; }
        .site-footer { padding: 1.5rem 1.25rem; }
    }
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
        const authorList = Array.isArray(a.authors) ? a.authors.map((au) => au.name).filter(Boolean) : [];
        const authors = authorList.join(", ");
        const year = a.journal_year ? `${a.journal_year}` : "";
        const issue = a.journal_issue ? `${a.journal_issue}-son` : "";
        const pages = a.first_page ? `${a.first_page}${a.last_page ? "–" + a.last_page : ""} bet` : "";
        return `<article class="listing-item" data-authors="${esc(authorList.join("|"))}">
            <div class="item-meta">
                ${year ? `<span class="year">${esc(year)}</span>` : ""}
                ${issue ? `<span class="issue">${esc(issue)}</span>` : ""}
                ${pages ? `<span class="pages">${esc(pages)}</span>` : ""}
            </div>
            <div>
                <h2><a href="/maqola/${esc(encodeURIComponent(a.slug))}">${esc(a.title)}</a></h2>
                ${authors ? `<p class="authors">${esc(authors)}</p>` : ""}
                ${a.abstract ? `<p class="abstract">${esc(a.abstract.slice(0, 320))}${a.abstract.length > 320 ? "…" : ""}</p>` : ""}
            </div>
        </article>`;
    }).join("\n");

    const uniqueAuthors = [...new Set(
        articles.flatMap((a) => Array.isArray(a.authors) ? a.authors.map((au) => au.name).filter(Boolean) : [])
    )].sort((a, b) => a.localeCompare(b, "uz"));
    const authorOptions = uniqueAuthors.map((name) => `<option value="${esc(name)}">${esc(name)}</option>`).join("");

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
    <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script>
        (function(){
            try {
                var t = localStorage.getItem("maqola-theme");
                if (t === "dark" || t === "light") document.documentElement.setAttribute("data-theme", t);
            } catch(e) {}
        })();
    </script>
    <style>${STYLES}</style>
</head>
<body>
    <header class="masthead">
        <div class="masthead-inner">
            <a href="/" class="brand">
                <img src="/assets/logo.png" alt="">
                <span>
                    <span class="brand-title">${esc(JOURNAL_TITLE)}</span>
                    <span class="brand-sub">Ilmiy-uslubiy, nazariy-amaliy elektron jurnal</span>
                </span>
            </a>
            <span class="masthead-meta">ISSN ${ISSN}</span>
        </div>
    </header>

    <nav class="top-nav">
        <div class="top-nav-inner">
            <a href="/#haqida">Haqida</a>
            <a href="/#talablar">Mualliflarga</a>
            <a href="/maqola" class="is-current">Maqolalar</a>
            <a href="/#arxiv">Arxiv</a>
            <a href="/#tahririyat">Tahririyat</a>
            <a href="/#aloqa">Aloqa</a>
            <button class="theme-toggle" id="theme-toggle" type="button" aria-label="Rejimni almashtirish">
                <span class="moon" aria-hidden="true">☾</span>
                <span class="sun" aria-hidden="true">☀</span>
            </button>
        </div>
    </nav>

    <section class="page-head">
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Asosiy sahifa</a>
            <span class="sep">/</span>
            <strong>Maqolalar</strong>
        </nav>
        <div class="page-eyebrow">Ilmiy nashr · ${articles.length} maqola</div>
        <h1 class="page-title">Maqolalar</h1>
    </section>

    <section class="listing-wrap">
        ${articles.length ? `
        <div class="search-bar" role="search">
            <input type="search" id="live-search" placeholder="Sarlavha, muallif yoki matn bo'yicha qidiring…" autocomplete="off" aria-label="Maqolalarni qidirish">
            <select id="author-filter" aria-label="Muallif bo'yicha filtrlash">
                <option value="">Barcha mualliflar</option>
                ${authorOptions}
            </select>
            <span class="search-count" id="search-count" aria-live="polite"></span>
        </div>
        <div class="articles-list" id="articles-list">${rows}</div>
        <div class="search-no-results" id="search-no-results" role="status">
            <strong>Hech narsa topilmadi</strong>
            <p>Boshqa so'z yoki muallifni tanlab ko'ring.</p>
        </div>
        <script>
            (function () {
                var input = document.getElementById("live-search");
                var authorSel = document.getElementById("author-filter");
                var count = document.getElementById("search-count");
                var empty = document.getElementById("search-no-results");
                var items = Array.prototype.slice.call(document.querySelectorAll(".listing-item"));
                var total = items.length;
                function norm(s) { return (s || "").toLowerCase().trim(); }
                function apply() {
                    var q = norm(input.value);
                    var a = authorSel.value;
                    var visible = 0;
                    items.forEach(function (item) {
                        var text = norm(item.textContent);
                        var authors = (item.getAttribute("data-authors") || "").split("|");
                        var matchesText = !q || text.indexOf(q) !== -1;
                        var matchesAuthor = !a || authors.indexOf(a) !== -1;
                        var ok = matchesText && matchesAuthor;
                        item.style.display = ok ? "" : "none";
                        if (ok) visible++;
                    });
                    count.textContent = (q || a) ? visible + " / " + total + " topildi" : total + " ta maqola";
                    empty.classList.toggle("is-visible", visible === 0 && (q || a));
                }
                input.addEventListener("input", apply);
                authorSel.addEventListener("change", apply);
                apply();
            })();
        </script>
        ` : `<div class="empty"><h3>Maqolalar hali qo'shilmagan</h3><p>Yangi sonlar tez orada shu yerda paydo bo'ladi.</p></div>`}
    </section>

    <footer class="site-footer">
        <div class="footer-inner">
            <span class="footer-copy">© ${esc(PUBLISHER)}</span>
            <span>Designed &amp; developed by <a href="https://teiior.uz" target="_blank" rel="noopener noreferrer">teiior</a></span>
        </div>
    </footer>

    <script>
        (function () {
            var btn = document.getElementById("theme-toggle");
            if (btn) btn.addEventListener("click", function () {
                var current = document.documentElement.getAttribute("data-theme") || "light";
                var next = current === "dark" ? "light" : "dark";
                document.documentElement.setAttribute("data-theme", next);
                try { localStorage.setItem("maqola-theme", next); } catch(e) {}
            });
        })();
    </script>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    res.status(200).send(html);
}
