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
        --page-bg: #0a2038;
        --rail: #0a2038;
        --rail-2: #0d2746;
        --paper: #f7f3ea;
        --paper-2: #fefcf7;
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
        line-height: 1.7;
        min-height: 100vh;
    }
    .ms-shell { display: grid; grid-template-columns: 260px 1fr; min-height: 100vh; }
    @media (max-width: 900px) { .ms-shell { grid-template-columns: 1fr; } }

    .rail {
        background: var(--rail); color: var(--rail-text);
        padding: 36px 26px;
        display: flex; flex-direction: column; gap: 26px;
        border-right: 1px solid var(--rail-line);
    }
    @media (max-width: 900px) { .rail { padding: 20px; } }

    .rail-brand {
        display: flex; gap: 12px; align-items: flex-start;
        text-decoration: none; color: inherit;
        padding-bottom: 20px; border-bottom: 1px solid var(--rail-line);
    }
    .rail-brand img { width: 44px; height: 44px; filter: brightness(0) invert(1); opacity: 0.9; }
    .rail-brand strong { font-family: "Sora", system-ui, sans-serif; font-size: 15px; font-weight: 700; display: block; line-height: 1.3; }
    .rail-brand em { font-style: normal; font-size: 11.5px; color: var(--rail-muted); text-transform: uppercase; letter-spacing: 0.07em; display: block; margin-top: 4px; }

    .rail-nav { display: flex; flex-direction: column; gap: 4px; }
    .rail-nav a {
        display: flex; align-items: center; gap: 12px;
        padding: 10px 12px; color: var(--rail-text);
        text-decoration: none; font-size: 14px; border-radius: 4px;
        transition: background 0.2s, color 0.2s;
    }
    .rail-nav a:hover { background: var(--rail-2); color: #fff; }
    .rail-nav a.is-current { background: var(--rail-2); color: var(--gold-light); }
    .rail-nav a .num { color: var(--gold); font-size: 11px; font-weight: 700; letter-spacing: 0.08em; min-width: 22px; }

    .rail-foot {
        margin-top: auto; padding-top: 20px;
        border-top: 1px solid var(--rail-line);
        font-size: 12px; color: var(--rail-muted);
    }
    .rail-cta {
        display: inline-block; padding: 10px 16px;
        background: var(--gold); color: var(--navy-deep) !important;
        border-radius: 4px; text-decoration: none;
        font-weight: 700; font-size: 13px; text-align: center;
    }

    .main {
        background: var(--paper);
        padding: 48px 56px 64px;
        min-height: 100vh;
    }
    @media (max-width: 900px) { .main { padding: 32px 22px 48px; } }

    .article-frame {
        max-width: 820px;
        margin: 0 auto;
    }

    .breadcrumb {
        display: flex; flex-wrap: wrap; gap: 8px;
        font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;
        color: var(--muted); margin-bottom: 24px;
    }
    .breadcrumb a { color: var(--muted); text-decoration: none; }
    .breadcrumb a:hover { color: var(--navy); }
    .breadcrumb strong { color: var(--navy); }

    .article-meta-strip {
        display: inline-block;
        padding: 4px 12px;
        background: var(--navy-deep);
        color: var(--gold-light);
        font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;
        font-weight: 700; border-radius: 3px;
        margin-bottom: 14px;
    }
    h1.article-title {
        font-family: "Sora", system-ui, sans-serif;
        font-size: clamp(26px, 3vw, 36px);
        line-height: 1.2;
        margin: 0 0 14px;
        color: var(--ink);
        font-weight: 700;
        letter-spacing: -0.015em;
    }
    .article-rubric {
        display: inline-block; padding: 4px 12px;
        border: 1px solid var(--gold); color: var(--gold-deep);
        font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
        font-weight: 700; border-radius: 3px;
    }

    .article-authors {
        display: grid; gap: 14px;
        margin: 26px 0;
        padding: 22px 24px;
        background: var(--paper-2);
        border-left: 3px solid var(--gold);
        border-radius: 4px;
    }
    .author { display: grid; gap: 4px; font-size: 14px; }
    .author strong { font-family: "Sora", system-ui, sans-serif; font-size: 15.5px; color: var(--ink); font-weight: 600; }
    .author span { color: var(--muted); font-style: italic; }
    .author a { color: var(--navy); text-decoration: none; font-size: 13px; }
    .author a:hover { text-decoration: underline; }

    h2.section-title {
        font-family: "Sora", system-ui, sans-serif;
        font-size: 16px; text-transform: uppercase; letter-spacing: 0.08em;
        color: var(--navy); font-weight: 700;
        margin: 32px 0 14px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--line);
    }

    .article-abstract p, .article-keywords p {
        color: var(--text);
        font-size: 15.5px;
        line-height: 1.8;
        margin: 0;
    }
    .article-keywords p { font-style: italic; color: var(--muted); }

    .article-doi { font-size: 14px; margin: 12px 0; color: var(--muted); }
    .article-doi a { color: var(--navy); font-weight: 600; text-decoration: none; }
    .article-doi a:hover { text-decoration: underline; }

    .article-pdf {
        display: flex; align-items: center; gap: 16px;
        margin: 32px 0;
        padding: 22px 24px;
        background: linear-gradient(135deg, var(--navy) 0%, var(--navy-deep) 100%);
        border-radius: 6px; color: #fff;
    }
    .article-pdf .icon { font-size: 30px; }
    .article-pdf .txt { flex: 1; }
    .article-pdf .txt strong { display: block; font-family: "Sora", system-ui, sans-serif; font-size: 16px; }
    .article-pdf .txt small { display: block; font-size: 12.5px; opacity: 0.8; margin-top: 2px; }
    .article-pdf a.download {
        padding: 12px 22px;
        background: var(--gold);
        color: var(--navy-deep);
        border-radius: 4px; text-decoration: none;
        font-weight: 700; font-size: 13px;
        text-transform: uppercase; letter-spacing: 0.08em;
        transition: background 0.2s;
    }
    .article-pdf a.download:hover { background: var(--gold-light); }

    .article-refs pre {
        white-space: pre-wrap; word-break: break-word;
        background: var(--paper-2);
        border: 1px solid var(--line);
        padding: 18px 20px;
        border-radius: 4px;
        font-family: "Georgia", "Times New Roman", serif;
        font-size: 13.5px; line-height: 1.75;
        color: var(--text);
    }

    .foot-note {
        margin-top: 48px;
        padding-top: 24px;
        border-top: 1px solid var(--line);
        font-size: 12px;
        color: var(--muted);
    }
    .foot-note a { color: inherit; text-decoration: underline; text-underline-offset: 3px; }
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

    const metaStrip = [
        article.journal_year && `${article.journal_year}`,
        article.journal_issue && `${article.journal_issue}-son`,
        article.first_page && `${article.first_page}${article.last_page ? "–" + article.last_page : ""}-bet`
    ].filter(Boolean).join(" · ");

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
        ? `<section class="article-keywords"><h2 class="section-title">Kalit so'zlar</h2><p>${esc(article.keywords.join(", "))}</p></section>` : "";
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
                <p style="margin:10px 0 0;">OAK ro'yxati · 2025-yil 31-oktabr<br>№376/5 · san'atshunoslik</p>
            </div>
        </aside>

        <main class="main">
            <div class="article-frame">
                <nav class="breadcrumb" aria-label="Breadcrumb">
                    <a href="/">Asosiy sahifa</a>
                    <span>/</span>
                    <a href="/maqola">Maqolalar</a>
                    <span>/</span>
                    <strong>Maqola</strong>
                </nav>

                <header>
                    ${metaStrip ? `<span class="article-meta-strip">${esc(metaStrip)}</span>` : ""}
                    <h1 class="article-title">${esc(article.title)}</h1>
                    ${article.rubric ? `<span class="article-rubric">${esc(article.rubric)}</span>` : ""}
                </header>

                ${authorsBlock}
                ${doiHtml}
                ${abstractHtml}
                ${keywordsHtml}
                ${pdfBlock}
                ${refsHtml}

                <p class="foot-note">© «${esc(JOURNAL_TITLE)}» elektron jurnali. Maqoladagi ma'lumotlar to'g'riligi va ilgari surilgan g'oya uchun muallif javobgardir. Designed &amp; developed by <a href="https://teiior.uz" target="_blank" rel="noopener noreferrer">teiior</a></p>
            </div>
        </main>
    </div>
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
            `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Maqola topilmadi — ${JOURNAL_TITLE_SHORT}</title></head><body style="font-family:Onest,system-ui;max-width:600px;margin:60px auto;padding:24px;text-align:center;background:#f7f3ea;"><div style="background:#fff;padding:40px;border-radius:6px;"><h1 style="color:#143a6b;">Maqola topilmadi</h1><p><a href="/maqola" style="color:#143a6b;">Barcha maqolalar</a> · <a href="/" style="color:#143a6b;">Bosh sahifa</a></p></div></body></html>`
        );
        return;
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    res.status(200).send(renderHtml(data));
}
