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

function renderHtml(article) {
    const authors = Array.isArray(article.authors) ? article.authors : [];
    const authorNames = authors.map((a) => a.name).filter(Boolean);
    const authorMeta = authorNames.map((n) => `    <meta name="citation_author" content="${esc(n)}">`).join("\n");
    const orcidMeta = authors
        .filter((a) => a.orcid)
        .map((a) => `    <meta name="citation_author_orcid" content="${esc(a.orcid)}">`)
        .join("\n");
    const affMeta = authors
        .filter((a) => a.affiliation)
        .map((a) => `    <meta name="citation_author_institution" content="${esc(a.affiliation)}">`)
        .join("\n");

    const canonical = `${SITE_ORIGIN}/maqola/${encodeURIComponent(article.slug)}`;
    const pubDate = article.published_at ? new Date(article.published_at).toISOString().slice(0, 10) : (article.journal_year ? String(article.journal_year) : "");
    const pdfHref = pdfUrl(article);

    const doiMeta = article.doi ? `    <meta name="citation_doi" content="${esc(article.doi)}">` : "";
    const pagesMeta = [
        article.first_page ? `    <meta name="citation_firstpage" content="${article.first_page}">` : "",
        article.last_page ? `    <meta name="citation_lastpage" content="${article.last_page}">` : ""
    ].filter(Boolean).join("\n");
    const issueMeta = article.journal_issue ? `    <meta name="citation_issue" content="${article.journal_issue}">` : "";
    const keywordsMeta = Array.isArray(article.keywords) && article.keywords.length
        ? `    <meta name="citation_keywords" content="${esc(article.keywords.join("; "))}">`
        : "";
    const pdfMeta = pdfHref ? `    <meta name="citation_pdf_url" content="${esc(pdfHref)}">` : "";

    const abstractHtml = article.abstract
        ? `<section class="article-abstract"><h2>Annotatsiya</h2><p>${esc(article.abstract)}</p></section>`
        : "";
    const keywordsHtml = Array.isArray(article.keywords) && article.keywords.length
        ? `<section class="article-keywords"><h2>Kalit so'zlar</h2><p>${esc(article.keywords.join(", "))}</p></section>`
        : "";
    const refsHtml = article.references_list
        ? `<section class="article-refs"><h2>Foydalanilgan adabiyotlar</h2><pre>${esc(article.references_list)}</pre></section>`
        : "";
    const doiHtml = article.doi ? `<p><strong>DOI:</strong> <a href="https://doi.org/${esc(article.doi)}">${esc(article.doi)}</a></p>` : "";
    const pdfHtml = pdfHref
        ? `<p class="article-pdf-link"><a href="${esc(pdfHref)}" target="_blank" rel="noopener">📄 To'liq PDF matn</a></p>`
        : "";

    const authorsBlock = authors.length
        ? `<section class="article-authors">${authors.map((a) => `
            <div class="author">
                <strong>${esc(a.name)}</strong>
                ${a.affiliation ? `<span>${esc(a.affiliation)}</span>` : ""}
                ${a.orcid ? `<a href="https://orcid.org/${esc(a.orcid)}" target="_blank" rel="noopener">ORCID: ${esc(a.orcid)}</a>` : ""}
                ${a.email ? `<a href="mailto:${esc(a.email)}">${esc(a.email)}</a>` : ""}
            </div>`).join("")}</section>`
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
    <style>
        :root { color-scheme: light; }
        body { font-family: "Sora", "Onest", "Inter", system-ui, sans-serif; max-width: 780px; margin: 0 auto; padding: 40px 24px 80px; color: #12131a; line-height: 1.6; background: #fafbfd; }
        .breadcrumb { font-size: 13px; color: #6a6f80; margin-bottom: 24px; }
        .breadcrumb a { color: #143a86; text-decoration: none; }
        h1 { font-size: 26px; line-height: 1.25; margin: 0 0 16px; }
        .article-meta { font-size: 14px; color: #4a4e5a; margin: 0 0 24px; padding: 12px 16px; background: #eef3ff; border-radius: 8px; }
        h2 { font-size: 18px; margin: 32px 0 12px; color: #143a86; }
        .article-authors { display: grid; gap: 12px; margin: 20px 0; padding: 16px; background: #fff; border: 1px solid #e4e6ee; border-radius: 10px; }
        .author { display: grid; gap: 4px; font-size: 14px; }
        .author strong { font-size: 15px; }
        .author a { color: #143a86; text-decoration: none; }
        .article-pdf-link a { display: inline-block; padding: 10px 18px; background: #143a86; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .article-pdf-link a:hover { background: #0f2e6c; }
        pre { white-space: pre-wrap; word-break: break-word; background: #fff; border: 1px solid #e4e6ee; padding: 16px; border-radius: 8px; font-family: "Georgia", serif; font-size: 13px; line-height: 1.6; }
    </style>
</head>
<body>
    <nav class="breadcrumb">
        <a href="/">${esc(JOURNAL_TITLE_SHORT)}</a> ›
        <a href="/#maqolalar">Maqolalar</a> ›
        <span>${esc(article.title)}</span>
    </nav>

    <article>
        <h1>${esc(article.title)}</h1>

        <p class="article-meta">
            ${article.journal_year ? `${article.journal_year}` : ""}${article.journal_issue ? ` · ${article.journal_issue}-son` : ""}
            ${article.first_page ? ` · ${article.first_page}${article.last_page ? "–" + article.last_page : ""}-bet` : ""}
            ${article.rubric ? ` · ${esc(article.rubric)}` : ""}
        </p>

        ${authorsBlock}
        ${doiHtml}
        ${abstractHtml}
        ${keywordsHtml}
        ${pdfHtml}
        ${refsHtml}
    </article>
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
        .from("articles")
        .select("*")
        .eq("site", SITE)
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

    if (error) {
        res.status(500).send(`DB error: ${error.message}`);
        return;
    }
    if (!data) {
        res.status(404).setHeader("Content-Type", "text/html; charset=utf-8").send(
            `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Maqola topilmadi — ${JOURNAL_TITLE_SHORT}</title></head><body style="font-family:system-ui;max-width:600px;margin:60px auto;padding:24px;text-align:center;"><h1>Maqola topilmadi</h1><p><a href="/">Bosh sahifaga qaytish</a></p></body></html>`
        );
        return;
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    res.status(200).send(renderHtml(data));
}
