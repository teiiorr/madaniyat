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
        --page-bg: #f7f3ea;
        --paper: #f7f3ea;
        --paper-2: #fefcf7;
        --paper-3: #fdfaef;
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
    }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
        background: var(--page-bg);
        color: var(--text);
        font-family: "Onest", system-ui, -apple-system, sans-serif;
        line-height: 1.65;
        font-size: 16px;
        -webkit-font-smoothing: antialiased;
    }

    /* ==== Full-width topbar ==== */
    .topbar {
        background: var(--navy-deep);
        color: #fff;
        padding: 1rem 2rem;
        position: sticky; top: 0; z-index: 10;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .topbar-inner {
        max-width: 1400px; margin: 0 auto;
        display: flex; align-items: center; justify-content: space-between;
        gap: 1.5rem; flex-wrap: wrap;
    }
    .topbar-brand {
        display: flex; align-items: center; gap: 0.875rem;
        text-decoration: none; color: inherit;
    }
    .topbar-brand img {
        width: 42px; height: 42px; object-fit: contain;
        filter: brightness(0) invert(1); opacity: 0.95;
    }
    .topbar-brand-text { display: flex; flex-direction: column; gap: 2px; }
    .topbar-brand strong {
        font-family: "Sora", system-ui, sans-serif;
        font-size: 0.9375rem; font-weight: 700; letter-spacing: -0.005em; line-height: 1.2;
    }
    .topbar-brand em {
        font-style: normal;
        font-size: 0.6875rem; color: rgba(255, 255, 255, 0.6);
        text-transform: uppercase; letter-spacing: 0.08em;
    }
    .topbar-nav { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .topbar-nav a {
        color: rgba(255, 255, 255, 0.75);
        text-decoration: none;
        font-size: 0.8125rem; font-weight: 600;
        text-transform: uppercase; letter-spacing: 0.07em;
        padding: 0.5rem 0;
        border-bottom: 2px solid transparent;
        transition: color 0.2s, border-color 0.2s;
    }
    .topbar-nav a:hover { color: #fff; }
    .topbar-nav a.is-current { color: var(--gold-light); border-bottom-color: var(--gold); }
    .topbar-cta {
        background: var(--gold); color: var(--navy-deep) !important;
        padding: 0.5rem 1rem; border-radius: 4px;
        font-size: 0.75rem !important; font-weight: 800 !important;
        border-bottom: none !important;
        text-transform: uppercase; letter-spacing: 0.08em;
        transition: background 0.2s;
    }
    .topbar-cta:hover { background: var(--gold-light); }

    /* ==== Hero ==== */
    .page-hero {
        padding: 4.5rem 2rem 3rem;
        background:
            radial-gradient(circle at 15% 30%, rgba(201, 161, 62, 0.08), transparent 45%),
            var(--paper);
        border-bottom: 1px solid var(--line);
    }
    .hero-inner { max-width: 1200px; margin: 0 auto; }
    .breadcrumb {
        display: flex; flex-wrap: wrap; gap: 0.5rem;
        font-size: 0.75rem; font-weight: 600;
        letter-spacing: 0.09em; text-transform: uppercase;
        color: var(--muted); margin-bottom: 1.5rem;
    }
    .breadcrumb a { color: var(--muted); text-decoration: none; }
    .breadcrumb a:hover { color: var(--navy); }
    .breadcrumb strong { color: var(--navy); }
    .breadcrumb span.sep { opacity: 0.4; }

    .hero-header { display: flex; align-items: baseline; gap: 1.5rem; flex-wrap: wrap; }
    .hero-num {
        font-family: "Sora", system-ui, sans-serif;
        font-size: 3.5rem; font-weight: 700;
        color: var(--gold); line-height: 1;
        letter-spacing: -0.02em;
    }
    h1.hero-title {
        font-family: "Sora", system-ui, sans-serif;
        font-size: clamp(2rem, 4.5vw, 3.25rem);
        line-height: 1.05;
        margin: 0;
        color: var(--ink);
        font-weight: 700;
        letter-spacing: -0.025em;
        flex: 1;
    }
    .hero-lead {
        color: var(--muted);
        font-size: 1.0625rem;
        line-height: 1.7;
        max-width: 60ch;
        margin: 1rem 0 0;
    }
    .hero-count {
        display: inline-block;
        margin-top: 1.25rem;
        padding: 0.5rem 1rem;
        background: var(--navy-deep);
        color: var(--gold-light);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.11em;
        font-weight: 700;
        border-radius: 4px;
    }

    /* ==== Listing ==== */
    .listing-section {
        padding: 2.5rem 2rem 4rem;
        background: var(--paper);
    }
    .listing-inner { max-width: 1200px; margin: 0 auto; }

    .search-bar {
        display: grid;
        grid-template-columns: 1fr minmax(220px, 280px) auto;
        align-items: center;
        gap: 0.875rem;
        margin: 0 0 2rem;
        padding: 1rem 1.25rem;
        background: var(--paper-2);
        border: 1px solid var(--line);
        border-radius: 8px;
    }
    @media (max-width: 720px) {
        .search-bar { grid-template-columns: 1fr; }
        .search-bar .search-count { text-align: left; }
    }
    .search-bar input, .search-bar select {
        padding: 0.6875rem 0.875rem;
        border: 1px solid var(--line);
        border-radius: 4px;
        font: inherit; font-size: 0.9375rem;
        background: #fff; color: var(--text);
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
        outline: none;
        border-color: var(--navy);
        box-shadow: 0 0 0 3px rgba(20, 58, 107, 0.14);
    }
    .search-bar .search-count {
        font-size: 0.8125rem; color: var(--muted); font-weight: 600;
        min-width: 120px; text-align: right; padding: 0 0.375rem;
    }

    .articles-list {
        display: grid;
        gap: 1.25rem;
        grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    }
    .listing-item {
        padding: 1.75rem;
        background: var(--paper-2);
        border: 1px solid var(--line);
        border-radius: 8px;
        display: flex; flex-direction: column;
        gap: 0.75rem;
        transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    }
    .listing-item:hover {
        transform: translateY(-3px);
        border-color: var(--gold);
        box-shadow: 0 14px 34px rgba(8, 26, 48, 0.12);
    }
    .listing-item .issue-badge {
        display: inline-block; align-self: flex-start;
        padding: 0.25rem 0.75rem;
        background: var(--navy-deep);
        color: var(--gold-light);
        font-size: 0.6875rem;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-weight: 700;
        border-radius: 3px;
    }
    .listing-item h2 {
        font-family: "Sora", system-ui, sans-serif;
        font-size: 1.1875rem;
        line-height: 1.3;
        margin: 0;
        font-weight: 600;
        letter-spacing: -0.005em;
    }
    .listing-item h2 a { color: var(--ink); text-decoration: none; }
    .listing-item h2 a:hover {
        color: var(--navy);
        text-decoration: underline;
        text-decoration-color: var(--gold);
        text-underline-offset: 4px;
    }
    .listing-item .authors {
        font-style: italic; color: var(--text);
        margin: 0; font-size: 0.9375rem;
    }
    .listing-item .abstract {
        color: var(--muted);
        font-size: 0.9375rem;
        margin: 0;
        line-height: 1.65;
        flex: 1;
    }
    .listing-item .read-more {
        margin-top: 0.375rem;
        color: var(--navy);
        font-size: 0.8125rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        text-decoration: none;
        display: inline-flex; align-items: center; gap: 0.375rem;
    }
    .listing-item .read-more::after { content: "→"; transition: transform 0.2s; }
    .listing-item:hover .read-more::after { transform: translateX(4px); }

    .empty {
        padding: 4rem 1.5rem;
        text-align: center;
        color: var(--muted);
        background: var(--paper-2);
        border: 1px dashed var(--line);
        border-radius: 8px;
    }
    .empty h3 { font-family: "Sora", system-ui, sans-serif; margin: 0 0 0.5rem; color: var(--ink); font-size: 1.125rem; }

    .search-no-results {
        padding: 2.5rem 1.5rem;
        text-align: center;
        color: var(--muted);
        background: var(--paper-2);
        border: 1px dashed var(--line);
        border-radius: 8px;
        display: none;
    }
    .search-no-results.is-visible { display: block; }
    .search-no-results strong {
        font-family: "Sora", system-ui, sans-serif;
        display: block; color: var(--navy);
        font-size: 1.0625rem; margin-bottom: 0.375rem;
    }

    /* Footer */
    .site-footer {
        background: var(--navy-deep);
        color: rgba(255, 255, 255, 0.6);
        padding: 2rem;
    }
    .footer-inner {
        max-width: 1400px; margin: 0 auto;
        display: flex; justify-content: space-between; align-items: center;
        flex-wrap: wrap; gap: 1rem;
    }
    .footer-inner .foot-brand { font-size: 0.75rem; letter-spacing: 0.05em; text-transform: uppercase; }
    .foot-credit { font-size: 0.75rem; margin: 0; }
    .foot-credit a { color: var(--gold-light); text-decoration: underline; text-underline-offset: 3px; }

    @media (max-width: 720px) {
        .page-hero { padding: 3rem 1.25rem 2rem; }
        .hero-num { font-size: 2.5rem; }
        .listing-section { padding: 2rem 1.25rem 3rem; }
        .articles-list { grid-template-columns: 1fr; }
        .topbar { padding: 0.875rem 1.25rem; }
        .topbar-nav { gap: 1rem; }
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
        const issue = [a.journal_year, a.journal_issue && `${a.journal_issue}-son`].filter(Boolean).join(" · ");
        const pages = a.first_page ? `${a.first_page}${a.last_page ? "–" + a.last_page : ""}-bet` : "";
        const meta = [issue, pages].filter(Boolean).join(" · ");
        return `<article class="listing-item" data-authors="${esc(authorList.join("|"))}">
            ${meta ? `<span class="issue-badge">${esc(meta)}</span>` : ""}
            <h2><a href="/maqola/${esc(encodeURIComponent(a.slug))}">${esc(a.title)}</a></h2>
            ${authors ? `<p class="authors">${esc(authors)}</p>` : ""}
            ${a.abstract ? `<p class="abstract">${esc(a.abstract.slice(0, 240))}${a.abstract.length > 240 ? "…" : ""}</p>` : ""}
            <a class="read-more" href="/maqola/${esc(encodeURIComponent(a.slug))}">O'qish</a>
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
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>${STYLES}</style>
</head>
<body>
    <header class="topbar">
        <div class="topbar-inner">
            <a class="topbar-brand" href="/">
                <img src="/assets/logo.png" alt="">
                <span class="topbar-brand-text">
                    <strong>O'zbekiston madaniyati va san'ati</strong>
                    <em>ISSN ${ISSN} · OAK ro'yxatida</em>
                </span>
            </a>
            <nav class="topbar-nav">
                <a href="/#haqida">Haqida</a>
                <a href="/#talablar">Mualliflarga</a>
                <a href="/maqola" class="is-current">Maqolalar</a>
                <a href="/#arxiv">Arxiv</a>
                <a href="/#tahririyat">Tahririyat</a>
                <a href="/#aloqa" class="topbar-cta">Maqola yuborish</a>
            </nav>
        </div>
    </header>

    <section class="page-hero">
        <div class="hero-inner">
            <nav class="breadcrumb" aria-label="Breadcrumb">
                <a href="/">Asosiy sahifa</a>
                <span class="sep">/</span>
                <strong>Maqolalar</strong>
            </nav>
            <div class="hero-header">
                <span class="hero-num">06</span>
                <h1 class="hero-title">Maqolalar</h1>
            </div>
            <p class="hero-lead">${esc(JOURNAL_TITLE)} — chop etilgan barcha ilmiy maqolalar. Har bir maqola alohida sahifada, to'liq metama'lumot va PDF matn bilan.</p>
            <span class="hero-count">${articles.length} ta nashr etilgan maqola</span>
        </div>
    </section>

    <section class="listing-section">
        <div class="listing-inner">
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
                <p style="margin: 0;">Boshqa so'z yoki muallifni tanlab ko'ring.</p>
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
        </div>
    </section>

    <footer class="site-footer">
        <div class="footer-inner">
            <span class="foot-brand">© ${esc(PUBLISHER)}</span>
            <p class="foot-credit">Designed &amp; developed by <a href="https://teiior.uz" target="_blank" rel="noopener noreferrer">teiior</a></p>
        </div>
    </footer>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    res.status(200).send(html);
}
