// Vercel Serverless Function: /api/article/[slug]
// Serves an HTML page with full Google Scholar / Highwire Press citation metadata
// so that Google Scholar can index the article. Bots don't run JS; the meta tags
// must be present in the initial response — that's why this is server-rendered.

import { createClient } from "@supabase/supabase-js";

const SITE = "madaniyat";
const JOURNAL_TITLE = "O'zbekiston madaniyati va san'ati";
const JOURNAL_TITLE_SHORT = "O'zMS jurnali";
const ISSN = "3093-8597";
const PUBLISHER = "O'zbekiston davlat san'at va madaniyat instituti";
const SITE_ORIGIN = "https://juca.uz";

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

function esc(s) {
    return String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function pdfUrl(article) {
    if (article.pdf_url) return article.pdf_url;
    if (article.pdf_path) {
        const base = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "").replace(/\/+$/, "");
        return `${base}/storage/v1/object/public/article-pdfs/${article.pdf_path}`;
    }
    return null;
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
        --hair-2: #ede4cf;
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
        --hair-2: #2f3a52;
        --navy: #7ba8db;
        --navy-dark: #5f8fc5;
        --gold: #d4a952;
        --gold-deep: #b48a3e;
        --footer-bg: #050810;
        --footer-text: #ffffff;
    }
    :root[data-theme="dark"] body { background: var(--paper); color: var(--ink-2); }
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
        font-size: 19px;
        line-height: 1.72;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
    }

    /* Masthead */
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
    .brand-title {
        font-family: var(--serif); font-weight: 600;
        font-size: 1.0625rem; color: var(--ink);
        display: block; line-height: 1.2;
    }
    .brand-sub {
        font-family: var(--sans);
        font-size: 0.6875rem;
        text-transform: uppercase; letter-spacing: 0.14em;
        color: var(--muted); display: block; margin-top: 4px;
    }
    .masthead-meta {
        font-family: var(--sans);
        font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.14em;
        color: var(--muted);
    }

    /* Nav */
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

    /* Article */
    .article {
        max-width: 720px;
        margin: 0 auto;
        padding: 4rem 1.5rem 5rem;
    }

    .breadcrumb {
        display: flex; flex-wrap: wrap; gap: 0.4375rem;
        font-family: var(--sans);
        font-size: 0.6875rem; font-weight: 600;
        letter-spacing: 0.13em; text-transform: uppercase;
        color: var(--muted);
        margin-bottom: 3rem;
    }
    .breadcrumb a { color: var(--muted); text-decoration: none; transition: color 0.15s; }
    .breadcrumb a:hover { color: var(--navy); }
    .breadcrumb span.sep { opacity: 0.45; }
    .breadcrumb strong { color: var(--ink-2); font-weight: 700; }

    .article-eyebrow {
        font-family: var(--sans);
        font-size: 0.75rem;
        text-transform: uppercase; letter-spacing: 0.16em;
        color: var(--navy); font-weight: 600;
        margin-bottom: 1.25rem;
        display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;
    }
    .article-eyebrow .sep { color: var(--hair); font-weight: 400; }

    h1.article-title {
        font-family: var(--serif); font-weight: 600;
        font-size: clamp(1.875rem, 3.6vw, 2.75rem);
        line-height: 1.18;
        letter-spacing: -0.01em;
        color: var(--ink);
        margin: 0 0 1.5rem;
    }

    .byline {
        font-family: var(--serif);
        font-size: 1.0625rem; line-height: 1.65;
        color: var(--ink-2);
        margin: 0 0 1.25rem;
        padding-bottom: 1.75rem;
        border-bottom: 1px solid var(--hair);
    }
    .byline .byline-author { font-weight: 600; color: var(--ink); }
    .byline .byline-aff { color: var(--muted); font-style: italic; }
    .byline .byline-sep { color: var(--hair); margin: 0 0.5rem; }

    .rubric-line {
        font-family: var(--sans);
        font-size: 0.6875rem;
        text-transform: uppercase; letter-spacing: 0.16em;
        color: var(--muted);
        margin: -0.5rem 0 2rem;
    }
    .rubric-line strong { color: var(--gold-deep); font-weight: 600; }

    .lead {
        font-family: var(--serif);
        font-size: 1.1875rem; line-height: 1.65;
        color: var(--ink);
        margin: 2rem 0;
        padding: 0 0 0 1.25rem;
        border-left: 2px solid var(--navy);
        font-style: italic;
    }

    section.article-section { margin: 2.5rem 0; }
    h2.section-heading {
        font-family: var(--sans);
        font-size: 0.75rem;
        text-transform: uppercase; letter-spacing: 0.16em;
        color: var(--muted);
        font-weight: 700;
        margin: 0 0 1rem;
    }
    .article-section p {
        font-family: var(--serif);
        font-size: 1.0625rem; line-height: 1.8;
        color: var(--ink-2);
        margin: 0 0 1rem;
        text-align: justify;
        hyphens: auto;
    }
    .article-section p:last-child { margin-bottom: 0; }

    .keywords {
        font-family: var(--serif);
        font-style: italic; color: var(--muted);
        font-size: 1rem; margin: 0;
    }
    .keywords .kw { display: inline; }
    .keywords .kw + .kw::before {
        content: " · "; color: var(--hair); font-style: normal;
    }

    .details-line {
        font-family: var(--sans);
        font-size: 0.8125rem;
        color: var(--muted);
        margin: 2rem 0;
        padding: 1rem 0;
        border-top: 1px solid var(--hair);
        border-bottom: 1px solid var(--hair);
        display: grid; gap: 0.5rem;
    }
    .details-line .row { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: baseline; }
    .details-line .label {
        font-weight: 600; text-transform: uppercase;
        letter-spacing: 0.12em; font-size: 0.6875rem;
        color: var(--ink-2); min-width: 4rem;
    }
    .details-line a { color: var(--navy); text-decoration: none; }
    .details-line a:hover { text-decoration: underline; text-underline-offset: 3px; }

    .pdf-link {
        margin: 3rem 0;
        display: inline-flex; align-items: center; gap: 0.75rem;
        padding: 0.875rem 1.5rem;
        background: var(--navy);
        color: #fff;
        border-radius: 2px;
        font-family: var(--sans);
        font-size: 0.8125rem; font-weight: 600;
        text-decoration: none;
        text-transform: uppercase; letter-spacing: 0.14em;
        transition: background 0.2s;
    }
    .pdf-link:hover { background: var(--navy-dark); }
    .pdf-link .arrow { font-size: 1.125rem; line-height: 1; }

    .refs { margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--hair); }
    .refs pre {
        white-space: pre-wrap; word-break: break-word;
        font-family: var(--serif);
        font-size: 0.9375rem; line-height: 1.7;
        color: var(--ink-2); margin: 0;
    }

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
        body { font-size: 18px; }
        .article { padding: 2.5rem 1.25rem 3rem; }
        .top-nav a { padding: 0.875rem 0.875rem; font-size: 0.6875rem; letter-spacing: 0.1em; }
        .top-nav-inner { justify-content: flex-start; overflow-x: auto; }
        .masthead { padding: 1rem 1.25rem; }
        .site-footer { padding: 1.5rem 1.25rem; }
    }
`;

function renderHtml(article) {
    const authors = Array.isArray(article.authors) ? article.authors : [];
    const authorNames = authors.map((a) => a.name).filter(Boolean);
    const authorMeta = authorNames.map((n) => `    <meta name="citation_author" content="${esc(n)}">`).join("\n");
    const orcidMeta = authors.filter((a) => a.orcid)
        .map((a) => `    <meta name="citation_author_orcid" content="${esc(a.orcid)}">`).join("\n");
    const affMeta = authors.filter((a) => a.affiliation)
        .map((a) => `    <meta name="citation_author_institution" content="${esc(a.affiliation)}">`).join("\n");

    const canonical = `${SITE_ORIGIN}/maqola/${encodeURIComponent(article.slug)}`;
    const pubDate = article.published_at ? new Date(article.published_at).toISOString().slice(0, 10) : (article.journal_year ? String(article.journal_year) : "");
    const pdfHref = pdfUrl(article);

    const doiMeta = article.doi ? `    <meta name="citation_doi" content="${esc(article.doi)}">` : "";
    const pagesMeta = [
        article.first_page ? `    <meta name="citation_firstpage" content="${article.first_page}">` : "",
        article.last_page ? `    <meta name="citation_lastpage" content="${article.last_page}">` : ""
    ].filter(Boolean).join("\n");
    const issueMeta = article.journal_issue ? `    <meta name="citation_issue" content="${article.journal_issue}">` : "";
    const volumeMeta = article.journal_year ? `    <meta name="citation_volume" content="${article.journal_year}">` : "";
    const keywordsMeta = Array.isArray(article.keywords) && article.keywords.length
        ? `    <meta name="citation_keywords" content="${esc(article.keywords.join("; "))}">`
        : "";
    const pdfMeta = pdfHref ? `    <meta name="citation_pdf_url" content="${esc(pdfHref)}">` : "";

    const eyebrowParts = [
        article.journal_year && String(article.journal_year),
        article.journal_issue && `${article.journal_issue}-son`,
        article.first_page && `${article.first_page}${article.last_page ? "–" + article.last_page : ""}-bet`
    ].filter(Boolean);
    const eyebrow = eyebrowParts.length
        ? eyebrowParts.map((p, i) => i > 0 ? `<span class="sep">/</span> ${esc(p)}` : esc(p)).join(" ")
        : "";

    const byline = authors.length
        ? authors.map((a) => {
            const parts = [`<span class="byline-author">${esc(a.name)}</span>`];
            if (a.affiliation) parts.push(`<span class="byline-aff">${esc(a.affiliation)}</span>`);
            return parts.join(", ");
        }).join(`<span class="byline-sep">·</span>`)
        : "";

    const orcidRows = authors.filter(a => a.orcid || a.email).map(a => {
        const bits = [];
        if (a.orcid) bits.push(`<a href="https://orcid.org/${esc(a.orcid)}" target="_blank" rel="noopener">ORCID ${esc(a.orcid)}</a>`);
        if (a.email) bits.push(`<a href="mailto:${esc(a.email)}">${esc(a.email)}</a>`);
        return `<div class="row"><span class="label">${esc(a.name.split(/\s+/).slice(0, 2).join(" "))}</span>${bits.join(" · ")}</div>`;
    }).join("");

    const detailsRows = [];
    if (article.doi) detailsRows.push(`<div class="row"><span class="label">DOI</span><a href="https://doi.org/${esc(article.doi)}" target="_blank" rel="noopener">${esc(article.doi)}</a></div>`);
    if (article.udk) detailsRows.push(`<div class="row"><span class="label">UDK</span>${esc(article.udk)}</div>`);
    if (article.language) detailsRows.push(`<div class="row"><span class="label">Til</span>${esc(({ uz: "O'zbek", ru: "Rus", en: "Ingliz", kaa: "Qoraqalpoq" }[article.language]) || article.language)}</div>`);
    detailsRows.push(...orcidRows.split(/(?=<div class="row")/).filter(Boolean));

    const abstractHtml = article.abstract
        ? `<section class="article-section">
            <h2 class="section-heading">Annotatsiya</h2>
            <p>${esc(article.abstract)}</p>
          </section>` : "";

    const keywordsHtml = Array.isArray(article.keywords) && article.keywords.length
        ? `<section class="article-section">
            <h2 class="section-heading">Kalit so'zlar</h2>
            <p class="keywords">${article.keywords.map(k => `<span class="kw">${esc(k)}</span>`).join("")}</p>
          </section>` : "";

    const refsHtml = article.references_list
        ? `<section class="refs">
            <h2 class="section-heading">Foydalanilgan adabiyotlar</h2>
            <pre>${esc(article.references_list)}</pre>
          </section>` : "";

    const pdfBlock = pdfHref
        ? `<a class="pdf-link" href="${esc(pdfHref)}" target="_blank" rel="noopener">To'liq matn (PDF) <span class="arrow">→</span></a>`
        : "";

    return `<!DOCTYPE html>
<html lang="${esc(article.language || "uz")}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(article.title)} — ${esc(JOURNAL_TITLE_SHORT)}</title>
    <meta name="description" content="${esc((article.abstract || article.title || "").slice(0, 200))}">
    <link rel="canonical" href="${esc(canonical)}">

    <!-- Google Scholar / Highwire Press citation metadata -->
    <meta name="citation_journal_title" content="${esc(JOURNAL_TITLE)}">
    <meta name="citation_journal_abbrev" content="${esc(JOURNAL_TITLE_SHORT)}">
    <meta name="citation_publisher" content="${esc(PUBLISHER)}">
    <meta name="citation_issn" content="${ISSN}">
    <meta name="citation_title" content="${esc(article.title)}">
${authorMeta}
${orcidMeta}
${affMeta}
    <meta name="citation_publication_date" content="${esc(pubDate)}">
    <meta name="citation_date" content="${esc(pubDate)}">
    <meta name="citation_language" content="${esc(article.language || "uz")}">
    <meta name="citation_abstract_html_url" content="${esc(canonical)}">
${pdfMeta}
${doiMeta}
${volumeMeta}
${issueMeta}
${pagesMeta}
${keywordsMeta}

    <!-- Dublin Core -->
    <meta name="DC.title" content="${esc(article.title)}">
    <meta name="DC.creator" content="${esc(authorNames.join("; "))}">
    <meta name="DC.publisher" content="${esc(PUBLISHER)}">
    <meta name="DC.language" content="${esc(article.language || "uz")}">
    <meta name="DC.identifier" content="${esc(canonical)}">

    <meta property="og:type" content="article">
    <meta property="og:title" content="${esc(article.title)}">
    <meta property="og:description" content="${esc((article.abstract || "").slice(0, 200))}">
    <meta property="og:url" content="${esc(canonical)}">

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
                    <span class="brand-sub">Ilmiy elektron jurnal</span>
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

    <article class="article">
        <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="/">Asosiy sahifa</a>
            <span class="sep">/</span>
            <a href="/maqola">Maqolalar</a>
            <span class="sep">/</span>
            <strong>Maqola</strong>
        </nav>

        ${eyebrow ? `<div class="article-eyebrow">${eyebrow}</div>` : ""}

        <h1 class="article-title">${esc(article.title)}</h1>

        ${byline ? `<p class="byline">${byline}</p>` : ""}

        ${article.rubric ? `<p class="rubric-line"><strong>Rubrika:</strong> ${esc(article.rubric)}</p>` : ""}

        ${article.abstract ? `<p class="lead">${esc(article.abstract.slice(0, 260))}${article.abstract.length > 260 ? "…" : ""}</p>` : ""}

        ${pdfBlock}

        ${abstractHtml}
        ${keywordsHtml}

        ${detailsRows.length ? `<div class="details-line">${detailsRows.join("")}</div>` : ""}

        ${refsHtml}
    </article>

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
}

export default async function handler(req, res) {
    const { slug } = req.query;
    if (!slug) {
        res.status(400).send("slug required");
        return;
    }

    const { data, error } = await supabase
        .from("articles").select("*")
        .eq("site", SITE).eq("slug", slug).eq("is_published", true)
        .maybeSingle();

    if (error) {
        res.status(500).send(`DB error: ${error.message}`);
        return;
    }
    if (!data) {
        res.status(404).setHeader("Content-Type", "text/html; charset=utf-8").send(
            `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Maqola topilmadi — ${JOURNAL_TITLE_SHORT}</title></head><body style="font-family:Georgia,serif;max-width:600px;margin:80px auto;padding:24px;text-align:center;background:#fbf8f0;"><h1 style="color:#143a6b;font-weight:600;">Maqola topilmadi</h1><p><a href="/maqola" style="color:#143a6b;">Barcha maqolalar</a> · <a href="/" style="color:#143a6b;">Bosh sahifa</a></p></body></html>`
        );
        return;
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    res.status(200).send(renderHtml(data));
}
