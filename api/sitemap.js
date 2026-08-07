// Dynamic sitemap.xml — merges static site URLs with all published article URLs
// so Google + Google Scholar can discover every /maqola/<slug> page.

import { createClient } from "@supabase/supabase-js";

const SITE = "madaniyat";
const SITE_ORIGIN = "https://juca.uz";

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
);

function esc(s) {
    return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default async function handler(req, res) {
    const { data, error } = await supabase
        .from("articles")
        .select("slug, updated_at, published_at")
        .eq("site", SITE)
        .eq("is_published", true)
        .order("published_at", { ascending: false });

    const staticUrls = [
        { loc: `${SITE_ORIGIN}/`, priority: "1.0", changefreq: "weekly" },
        { loc: `${SITE_ORIGIN}/#maqolalar`, priority: "0.9", changefreq: "daily" },
        { loc: `${SITE_ORIGIN}/#arxiv`, priority: "0.8", changefreq: "weekly" },
        { loc: `${SITE_ORIGIN}/maqola`, priority: "0.9", changefreq: "daily" }
    ];

    const articleUrls = (data || []).map((a) => ({
        loc: `${SITE_ORIGIN}/maqola/${encodeURIComponent(a.slug)}`,
        lastmod: (a.updated_at || a.published_at || "").slice(0, 10),
        priority: "0.8",
        changefreq: "monthly"
    }));

    const urls = [...staticUrls, ...articleUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `    <url>
        <loc>${esc(u.loc)}</loc>
${u.lastmod ? `        <lastmod>${u.lastmod}</lastmod>\n` : ""}        <changefreq>${u.changefreq}</changefreq>
        <priority>${u.priority}</priority>
    </url>`).join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
    res.status(error ? 500 : 200).send(xml);
}
