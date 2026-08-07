import { supabase, SITE, pdfPublicUrl } from "./supabase-client.js";

const gridEl = document.getElementById("articles-grid");
const emptyEl = document.getElementById("articles-empty");
const searchEl = document.getElementById("articles-search");
const yearEl = document.getElementById("articles-year");
const langEl = document.getElementById("articles-language");

const LABELS = {
    empty: "Hozircha maqolalar yo'q.",
    loading: "Maqolalar yuklanmoqda...",
    yearAll: "Yil",
    langAll: "Til",
    pages: "b.",
    pdf: "PDF",
    full: "To'liq matn"
};

let cache = [];

export function initArticlesPublic() {
    if (!gridEl) return;
    load();
    searchEl?.addEventListener("input", debounce(render, 150));
    yearEl?.addEventListener("change", render);
    langEl?.addEventListener("change", render);
}

async function load() {
    setLoading();
    const { data, error } = await supabase
        .from("articles")
        .select("id, slug, title, authors, abstract, keywords, language, journal_year, journal_issue, first_page, last_page, doi, pdf_url, pdf_path, published_at")
        .eq("site", SITE)
        .eq("is_published", true)
        .order("published_at", { ascending: false });
    if (error) {
        gridEl.innerHTML = "";
        emptyEl.hidden = false;
        emptyEl.textContent = "Xato: " + error.message;
        return;
    }
    cache = data || [];
    populateYearFilter();
    render();
}

function populateYearFilter() {
    if (!yearEl) return;
    const years = [...new Set(cache.map((a) => a.journal_year).filter(Boolean))].sort((a, b) => b - a);
    const current = yearEl.value;
    yearEl.innerHTML = `<option value="">${LABELS.yearAll}</option>`;
    years.forEach((y) => {
        const opt = document.createElement("option");
        opt.value = String(y);
        opt.textContent = String(y);
        yearEl.append(opt);
    });
    yearEl.value = current;
}

function render() {
    const q = (searchEl?.value || "").trim().toLowerCase();
    const yearFilter = yearEl?.value || "";
    const langFilter = langEl?.value || "";

    const filtered = cache.filter((a) => {
        if (yearFilter && String(a.journal_year) !== yearFilter) return false;
        if (langFilter && a.language !== langFilter) return false;
        if (!q) return true;
        const authors = (a.authors || []).map((au) => au.name || "").join(" ").toLowerCase();
        return (a.title || "").toLowerCase().includes(q) || authors.includes(q);
    });

    gridEl.innerHTML = "";
    if (filtered.length === 0) {
        emptyEl.hidden = false;
        emptyEl.textContent = LABELS.empty;
        return;
    }
    emptyEl.hidden = true;
    filtered.forEach((a) => gridEl.append(renderCard(a)));
}

function renderCard(a) {
    const card = document.createElement("article");
    card.className = "article-card";

    const pdfHref = a.pdf_path ? pdfPublicUrl(a.pdf_path) : a.pdf_url;
    const detailHref = `/maqola/${encodeURIComponent(a.slug)}`;

    const issue = document.createElement("div");
    issue.className = "card-issue";
    issue.textContent = [a.journal_year, a.journal_issue && `${a.journal_issue}-son`].filter(Boolean).join(" · ");
    if (issue.textContent) card.append(issue);

    const title = document.createElement("h4");
    title.className = "card-title";
    const titleLink = document.createElement("a");
    titleLink.href = detailHref;
    titleLink.textContent = a.title || "";
    title.append(titleLink);
    card.append(title);

    const authorNames = (a.authors || []).map((au) => au.name).filter(Boolean).join(", ");
    if (authorNames) {
        const authors = document.createElement("p");
        authors.className = "card-authors";
        authors.textContent = authorNames;
        card.append(authors);
    }

    if (a.abstract) {
        const abs = document.createElement("p");
        abs.className = "card-abstract";
        abs.textContent = a.abstract;
        card.append(abs);
    }

    const footer = document.createElement("div");
    footer.className = "card-footer";

    const pages = document.createElement("span");
    pages.className = "card-pages";
    if (a.first_page) {
        pages.textContent = `${a.first_page}${a.last_page ? "–" + a.last_page : ""} ${LABELS.pages}`;
    }
    footer.append(pages);

    const actions = document.createElement("div");
    actions.className = "card-actions";
    if (pdfHref) {
        const pdf = document.createElement("a");
        pdf.href = pdfHref;
        pdf.target = "_blank";
        pdf.rel = "noopener";
        pdf.textContent = LABELS.pdf;
        actions.append(pdf);
    }
    const detail = document.createElement("a");
    detail.href = detailHref;
    detail.textContent = LABELS.full;
    actions.append(detail);

    footer.append(actions);
    card.append(footer);

    return card;
}

function setLoading() {
    if (!gridEl) return;
    gridEl.innerHTML = `<div class="articles-loading">${LABELS.loading}</div>`;
    if (emptyEl) emptyEl.hidden = true;
}

function debounce(fn, ms) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}
