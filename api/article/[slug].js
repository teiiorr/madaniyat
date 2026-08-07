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
        --page-bg: #f7f3ea;
        --paper: #f7f3ea;
        --paper-2: #fefcf7;
        --paper-3: #fdfaef;
        --text: #25303f;
        --ink: #122039;
        --muted: #6a7382;
        --line: #e6dcc9;
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
        background: var(--paper-2);
        color: var(--text);
        font-family: "Onest", system-ui, -apple-system, sans-serif;
        line-height: 1.75;
        font-size: 17px;
        -webkit-font-smoothing: antialiased;
    }

    /* Topbar */
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
    .topbar-brand { display: flex; align-items: center; gap: 0.875rem; text-decoration: none; color: inherit; }
    .topbar-brand img { width: 42px; height: 42px; filter: brightness(0) invert(1); opacity: 0.95; }
    .topbar-brand-text { display: flex; flex-direction: column; gap: 2px; }
    .topbar-brand strong { font-family: "Sora", system-ui, sans-serif; font-size: 0.9375rem; font-weight: 700; line-height: 1.2; }
    .topbar-brand em { font-style: normal; font-size: 0.6875rem; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 0.08em; }
    .topbar-nav { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .topbar-nav a {
        color: rgba(255, 255, 255, 0.75); text-decoration: none;
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
    }
    .topbar-cta:hover { background: var(--gold-light); }

    /* Cover */
    .article-cover {
        padding: 4rem 2rem 3rem;
        background:
            radial-gradient(circle at 15% 30%, rgba(201, 161, 62, 0.06), transparent 50%),
            var(--paper);
        border-bottom: 1px solid var(--line);
    }
    .article-cover-inner { max-width: 820px; margin: 0 auto; }

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

    .meta-line {
        display: inline-block;
        padding: 0.4375rem 0.875rem;
        background: var(--navy-deep);
        color: var(--gold-light);
        font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.11em;
        font-weight: 700; border-radius: 3px;
        margin-bottom: 1.25rem;
    }
    h1.article-title {
        font-family: "Sora", system-ui, sans-serif;
        font-size: clamp(1.75rem, 3.4vw, 2.75rem);
        line-height: 1.15;
        margin: 0 0 1.25rem;
        color: var(--ink);
        font-weight: 700;
        letter-spacing: -0.025em;
    }
    .rubric-tag {
        display: inline-block;
        padding: 0.375rem 0.875rem;
        border: 1.5px solid var(--gold);
        color: var(--gold-deep);
        font-size: 0.6875rem; font-weight: 800;
        text-transform: uppercase; letter-spacing: 0.1em;
        border-radius: 2px;
    }

    /* Body */
    .article-body {
        background: var(--paper-2);
        padding: 3rem 2rem 4rem;
    }
    .article-body-inner { max-width: 820px; margin: 0 auto; }

    .article-authors {
        display: grid; gap: 1.125rem;
        margin: 0 0 2.5rem;
        padding: 1.75rem 2rem;
        background: var(--paper);
        border-left: 4px solid var(--gold);
        border-radius: 4px;
    }
    .author { display: grid; gap: 0.25rem; }
    .author strong {
        font-family: "Sora", system-ui, sans-serif;
        font-size: 1.0625rem; color: var(--ink); font-weight: 600;
        letter-spacing: -0.005em;
    }
    .author span { color: var(--muted); font-style: italic; font-size: 0.9375rem; }
    .author a {
        color: var(--navy); text-decoration: none;
        font-size: 0.875rem; font-weight: 500;
        margin-top: 0.125rem; display: inline-block;
    }
    .author a:hover { text-decoration: underline; text-underline-offset: 3px; }

    h2.section-title {
        font-family: "Sora", system-ui, sans-serif;
        font-size: 0.9375rem; text-transform: uppercase; letter-spacing: 0.12em;
        color: var(--navy); font-weight: 700;
        margin: 2.75rem 0 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--line);
    }

    .article-abstract p, .article-keywords p {
        color: var(--text);
        font-size: 1.0625rem; line-height: 1.9;
        margin: 0;
    }
    .article-keywords p {
        font-style: italic; color: #4a5460;
        padding: 0.875rem 1.25rem;
        background: var(--paper);
        border-radius: 4px;
    }

    .article-doi {
        font-size: 0.9375rem; margin: 1rem 0 0; color: var(--muted);
        padding: 0.875rem 1.125rem;
        background: var(--paper);
        border-radius: 4px;
        border-left: 3px solid var(--gold-soft);
    }
    .article-doi strong { color: var(--ink); }
    .article-doi a { color: var(--navy); font-weight: 600; text-decoration: none; }
    .article-doi a:hover { text-decoration: underline; }

    .article-pdf {
        display: flex; align-items: center; gap: 1.25rem;
        margin: 3rem 0;
        padding: 1.75rem 2rem;
        background:
            radial-gradient(circle at 15% 20%, rgba(255,255,255,0.08), transparent 50%),
            linear-gradient(135deg, var(--navy) 0%, var(--navy-deep) 100%);
        border-radius: 8px;
        color: #fff;
        box-shadow: 0 12px 32px rgba(8, 26, 48, 0.18);
    }
    .article-pdf .icon {
        font-size: 2rem; width: 3rem; height: 3rem;
        display: grid; place-items: center;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
    }
    .article-pdf .txt { flex: 1; }
    .article-pdf .txt strong {
        display: block;
        font-family: "Sora", system-ui, sans-serif;
        font-size: 1.0625rem; font-weight: 700;
    }
    .article-pdf .txt small {
        display: block;
        font-size: 0.8125rem; opacity: 0.85; margin-top: 0.25rem;
    }
    .article-pdf a.download {
        padding: 0.75rem 1.375rem;
        background: var(--gold);
        color: var(--navy-deep);
        border-radius: 4px; text-decoration: none;
        font-weight: 700; font-size: 0.8125rem;
        text-transform: uppercase; letter-spacing: 0.1em;
        transition: background 0.2s, transform 0.15s;
        white-space: nowrap;
    }
    .article-pdf a.download:hover { background: var(--gold-light); transform: translateY(-1px); }

    .article-refs pre {
        white-space: pre-wrap; word-break: break-word;
        background: var(--paper);
        border: 1px solid var(--line);
        padding: 1.5rem 1.75rem;
        border-radius: 4px;
        font-family: "Georgia", "Times New Roman", serif;
        font-size: 0.9375rem;
        line-height: 1.85;
        color: var(--text);
        margin: 0;
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
        body { font-size: 16px; }
        .topbar { padding: 0.875rem 1.25rem; }
        .topbar-nav { gap: 1rem; }
        .article-cover { padding: 2.5rem 1.25rem 2rem; }
        .article-body { padding: 2rem 1.25rem 3rem; }
        .article-pdf { flex-direction: column; align-items: flex-start; padding: 1.5rem; }
        .article-authors { padding: 1.25rem 1.5rem; }
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

    const metaParts = [
        article.journal_year && `${article.journal_year}`,
        article.journal_issue && `${article.journal_issue}-son`,
        article.first_page && `${article.first_page}${article.last_page ? "–" + article.last_page : ""}-bet`
    ].filter(Boolean);
    const metaLineTxt = metaParts.join(" · ");

    const authorsBlock = authors.length ? `<section class="article-authors">${authors.map((a) => `
        <div class="author">
            <strong>${esc(a.name)}</strong>
            ${a.affiliation ? `<span>${esc(a.affiliation)}</span>` : ""}
            ${a.orcid ? `<a href="https://orcid.org/${esc(a.orcid)}" target="_blank" rel="noopener">ORCID: ${esc(a.orcid)}</a>` : ""}
            ${a.email ? `<a href="mailto:${esc(a.email)}">${esc(a.email)}</a>` : ""}
        </div>`).join("")}</section>` : "";

    const abstractHtml = article.abstract
        ? `<section class="article-abstract"><h2 class="section-title">Annotatsiya</h2><p>${esc(article.abstract)}</p></section>` : "";
    const keywordsHtml = Array.isArray(article.keywords) && article.keywords.length
        ? `<section class="article-keywords"><h2 class="section-title">Kalit so'zlar</h2><p>${esc(article.keywords.join(" · "))}</p></section>` : "";
    const refsHtml = article.references_list
        ? `<section class="article-refs"><h2 class="section-title">Foydalanilgan adabiyotlar</h2><pre>${esc(article.references_list)}</pre></section>` : "";
    const doiHtml = article.doi
        ? `<p class="article-doi"><strong>DOI:</strong> <a href="https://doi.org/${esc(article.doi)}" target="_blank" rel="noopener">${esc(article.doi)}</a></p>` : "";
    const pdfBlock = pdfHref ? `
        <div class="article-pdf">
            <span class="icon" aria-hidden="true">📄</span>
            <div class="txt">
                <strong>To'liq matn PDF formatda</strong>
                <small>Yangi oynada ochiladi</small>
            </div>
            <a class="download" href="${esc(pdfHref)}" target="_blank" rel="noopener">PDF ochish</a>
        </div>` : "";

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
    <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet">
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

    <section class="article-cover">
        <div class="article-cover-inner">
            <nav class="breadcrumb" aria-label="Breadcrumb">
                <a href="/">Asosiy sahifa</a>
                <span class="sep">/</span>
                <a href="/maqola">Maqolalar</a>
                <span class="sep">/</span>
                <strong>Maqola</strong>
            </nav>
            ${metaLineTxt ? `<span class="meta-line">${esc(metaLineTxt)}</span>` : ""}
            <h1 class="article-title">${esc(article.title)}</h1>
            ${article.rubric ? `<span class="rubric-tag">${esc(article.rubric)}</span>` : ""}
        </div>
    </section>

    <main class="article-body">
        <div class="article-body-inner">
            ${authorsBlock}
            ${doiHtml}
            ${abstractHtml}
            ${keywordsHtml}
            ${pdfBlock}
            ${refsHtml}
        </div>
    </main>

    <footer class="site-footer">
        <div class="footer-inner">
            <span class="foot-brand">© ${esc(PUBLISHER)}</span>
            <p class="foot-credit">Designed &amp; developed by <a href="https://teiior.uz" target="_blank" rel="noopener noreferrer">teiior</a></p>
        </div>
    </footer>
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
            `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Maqola topilmadi — ${JOURNAL_TITLE_SHORT}</title></head><body style="font-family:Onest,system-ui;max-width:600px;margin:60px auto;padding:24px;text-align:center;"><h1 style="color:#143a6b;">Maqola topilmadi</h1><p><a href="/maqola" style="color:#143a6b;">Barcha maqolalar</a> · <a href="/" style="color:#143a6b;">Bosh sahifa</a></p></body></html>`
        );
        return;
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    res.status(200).send(renderHtml(data));
}
