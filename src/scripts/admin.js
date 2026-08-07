import { supabase, SITES, getSite, setSite, slugify, pdfPublicUrl } from "./supabase-client.js";

const loginShell = document.getElementById("login-shell");
const appShell = document.getElementById("admin-shell");
const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");
const loginStatus = document.getElementById("login-status");
const logoutBtn = document.getElementById("logout-btn");
const userEmailLabel = document.getElementById("user-email");

const siteTabs = document.getElementById("site-tabs");
const listEl = document.getElementById("article-list");
const listFilterInput = document.getElementById("list-filter");
const listCountEl = document.getElementById("list-count");
const newBtn = document.getElementById("new-article-btn");

const editorEl = document.getElementById("article-editor");
const emptyEl = document.getElementById("editor-empty");
const form = document.getElementById("article-form");
const statusBox = document.getElementById("form-status");

let allArticles = [];
let currentId = null;

// --- Auth --------------------------------------------------------------------
async function initAuth() {
    const { data } = await supabase.auth.getSession();
    if (data.session) showApp(data.session.user);
    else showLogin();
    supabase.auth.onAuthStateChange((_event, session) => {
        if (session) showApp(session.user);
        else showLogin();
    });
}

function showLogin() {
    loginShell.hidden = false;
    appShell.hidden = true;
}

function showApp(user) {
    loginShell.hidden = true;
    appShell.hidden = false;
    userEmailLabel.textContent = user.email || "";
    renderSiteTabs();
    loadArticles();
}

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginStatus.textContent = "";
    loginStatus.className = "form-status";
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        loginStatus.textContent = error.message;
        loginStatus.className = "form-status err";
        loginStatus.hidden = false;
    }
});

logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    currentId = null;
    showEditorEmpty();
});

// --- Site tabs ---------------------------------------------------------------
function renderSiteTabs() {
    if (!siteTabs) return;
    siteTabs.innerHTML = "";
    SITES.forEach((s) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "site-tab" + (s.id === getSite() ? " is-active" : "");
        btn.dataset.site = s.id;
        btn.textContent = s.label;
        btn.addEventListener("click", () => {
            if (s.id === getSite()) return;
            setSite(s.id);
            currentId = null;
            showEditorEmpty();
            renderSiteTabs();
            loadArticles();
        });
        siteTabs.append(btn);
    });
}

// --- List --------------------------------------------------------------------
async function loadArticles() {
    listEl.innerHTML = '<li class="article-list-empty">Yuklanmoqda...</li>';
    if (listCountEl) listCountEl.textContent = "";
    const { data, error } = await supabase
        .from("articles")
        .select("id, title, authors, journal_year, journal_issue, is_published, published_at, updated_at")
        .eq("site", getSite())
        .order("updated_at", { ascending: false });
    if (error) {
        listEl.innerHTML = `<li class="article-list-empty">Xato: ${error.message}</li>`;
        return;
    }
    allArticles = data || [];
    renderList();
}

function renderList() {
    const filter = (listFilterInput.value || "").trim().toLowerCase();
    const items = allArticles.filter((a) =>
        !filter || (a.title || "").toLowerCase().includes(filter)
    );
    if (listCountEl) {
        listCountEl.textContent = filter
            ? `${items.length} / ${allArticles.length}`
            : `${allArticles.length}`;
    }
    if (items.length === 0) {
        listEl.innerHTML = '<li class="article-list-empty">Maqolalar yo‘q</li>';
        return;
    }
    listEl.innerHTML = "";
    items.forEach((a) => {
        const li = document.createElement("li");
        li.className = "article-list-item" + (a.id === currentId ? " is-active" : "");
        const title = document.createElement("span");
        title.className = "list-title";
        title.textContent = a.title || "(sarlavhasiz)";
        const meta = document.createElement("span");
        meta.className = "list-meta";
        const authors = Array.isArray(a.authors) ? a.authors.map((au) => au.name).filter(Boolean).join(", ") : "";
        const issue = a.journal_year ? `${a.journal_year}${a.journal_issue ? "-" + a.journal_issue : ""}` : "";
        const status = a.is_published ? "" : " · qoralama";
        meta.textContent = [authors, issue].filter(Boolean).join(" · ") + status;
        li.append(title, meta);
        li.addEventListener("click", () => selectArticle(a.id));
        listEl.append(li);
    });
}

listFilterInput.addEventListener("input", renderList);
newBtn.addEventListener("click", () => selectArticle(null));

// --- Editor ------------------------------------------------------------------
function showEditorEmpty() {
    editorEl.hidden = true;
    emptyEl.hidden = false;
}

function showEditor() {
    editorEl.hidden = false;
    emptyEl.hidden = true;
}

async function selectArticle(id) {
    currentId = id;
    renderList();
    showEditor();
    setStatus("");
    if (id === null) {
        fillForm({});
        return;
    }
    const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .single();
    if (error) {
        setStatus(error.message, "err");
        return;
    }
    fillForm(data);
}

function fillForm(a) {
    form.reset();
    form.querySelector('[name="id"]').value = a.id || "";
    form.querySelector('[name="title"]').value = a.title || "";
    const slugField = form.querySelector('[name="slug"]');
    slugField.value = a.slug || "";
    delete slugField.dataset.manual;
    form.querySelector('[name="abstract"]').value = a.abstract || "";
    form.querySelector('[name="keywords"]').value = Array.isArray(a.keywords) ? a.keywords.join(", ") : "";
    form.querySelector('[name="language"]').value = a.language || "uz";
    form.querySelector('[name="rubric"]').value = a.rubric || "";
    form.querySelector('[name="journal_year"]').value = a.journal_year || "";
    form.querySelector('[name="journal_issue"]').value = a.journal_issue || "";
    form.querySelector('[name="first_page"]').value = a.first_page || "";
    form.querySelector('[name="last_page"]').value = a.last_page || "";
    form.querySelector('[name="doi"]').value = a.doi || "";
    form.querySelector('[name="udk"]').value = a.udk || "";
    form.querySelector('[name="references_list"]').value = a.references_list || "";
    form.querySelector('[name="is_published"]').checked = a.is_published !== false;

    const existing = a.pdf_path ? pdfPublicUrl(a.pdf_path) : (a.pdf_url || null);
    const pdfExistingEl = document.getElementById("pdf-existing");
    pdfExistingEl.innerHTML = existing
        ? `Joriy fayl: <a href="${existing}" target="_blank" rel="noopener">ochish</a>`
        : "Fayl hali yuklanmagan";

    renderAuthors(Array.isArray(a.authors) && a.authors.length ? a.authors : [{ name: "" }]);
    document.getElementById("delete-btn").hidden = !a.id;
}

function renderAuthors(authors) {
    const wrap = document.getElementById("authors-list");
    wrap.innerHTML = "";
    authors.forEach((author, idx) => wrap.append(makeAuthorRow(author, idx)));
}

function makeAuthorRow(author, idx) {
    const row = document.createElement("div");
    row.className = "author-item";
    row.dataset.idx = String(idx);
    row.innerHTML = `
        <div class="author-grid">
            <div class="form-row">
                <label class="form-label">F.I.Sh <span class="hint">majburiy</span></label>
                <input type="text" name="author-name" value="${escapeAttr(author.name || "")}" required>
            </div>
            <div class="form-row">
                <label class="form-label">Ish joyi <span class="hint">affiliation</span></label>
                <input type="text" name="author-affiliation" value="${escapeAttr(author.affiliation || "")}">
            </div>
            <div class="form-row">
                <label class="form-label">ORCID <span class="hint">0000-0000-0000-0000</span></label>
                <input type="text" name="author-orcid" value="${escapeAttr(author.orcid || "")}" pattern="\\d{4}-\\d{4}-\\d{4}-\\d{3}[\\dX]">
            </div>
            <div class="form-row">
                <label class="form-label">Email <span class="hint">ixtiyoriy</span></label>
                <input type="email" name="author-email" value="${escapeAttr(author.email || "")}">
            </div>
        </div>
        <button type="button" class="author-remove" aria-label="Muallifni o'chirish">×</button>
    `;
    row.querySelector(".author-remove").addEventListener("click", () => row.remove());
    return row;
}

function escapeAttr(s) {
    return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

document.getElementById("add-author-btn").addEventListener("click", () => {
    const wrap = document.getElementById("authors-list");
    wrap.append(makeAuthorRow({}, wrap.children.length));
});

function collectAuthors() {
    const rows = document.querySelectorAll("#authors-list .author-item");
    const authors = [];
    rows.forEach((row) => {
        const name = row.querySelector('[name="author-name"]').value.trim();
        if (!name) return;
        const author = { name };
        const aff = row.querySelector('[name="author-affiliation"]').value.trim();
        const orcid = row.querySelector('[name="author-orcid"]').value.trim();
        const email = row.querySelector('[name="author-email"]').value.trim();
        if (aff) author.affiliation = aff;
        if (orcid) author.orcid = orcid;
        if (email) author.email = email;
        authors.push(author);
    });
    return authors;
}

function setStatus(text, kind) {
    statusBox.textContent = text || "";
    statusBox.className = "form-status" + (kind ? " " + kind : "");
    statusBox.hidden = !text;
}

form.querySelector('[name="title"]').addEventListener("input", (e) => {
    const slugField = form.querySelector('[name="slug"]');
    if (!currentId && !slugField.dataset.manual) {
        slugField.value = slugify(e.target.value);
    }
});
form.querySelector('[name="slug"]').addEventListener("input", (e) => {
    e.target.dataset.manual = "1";
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("Saqlanmoqda...", "info");
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
        const authors = collectAuthors();
        if (authors.length === 0) throw new Error("Kamida bitta muallif kiriting");

        const fd = new FormData(form);
        const payload = {
            site: getSite(),
            title: fd.get("title").trim(),
            slug: (fd.get("slug") || slugify(fd.get("title") || "")).trim(),
            abstract: fd.get("abstract").trim() || null,
            keywords: (fd.get("keywords") || "").split(",").map((k) => k.trim()).filter(Boolean),
            language: fd.get("language") || "uz",
            rubric: fd.get("rubric").trim() || null,
            journal_year: fd.get("journal_year") ? Number(fd.get("journal_year")) : null,
            journal_issue: fd.get("journal_issue") ? Number(fd.get("journal_issue")) : null,
            first_page: fd.get("first_page") ? Number(fd.get("first_page")) : null,
            last_page: fd.get("last_page") ? Number(fd.get("last_page")) : null,
            doi: fd.get("doi").trim() || null,
            udk: fd.get("udk").trim() || null,
            references_list: fd.get("references_list").trim() || null,
            is_published: fd.get("is_published") === "on",
            authors
        };

        if (!payload.title) throw new Error("Sarlavha bo'sh bo'lmasin");
        if (!payload.slug) throw new Error("Slug bo'sh bo'lmasin");

        const pdfInput = form.querySelector('input[name="pdf-file"]');
        const pdfFile = pdfInput.files && pdfInput.files[0];
        if (pdfFile) {
            if (pdfFile.type !== "application/pdf") throw new Error("Faqat PDF fayl");
            const fileName = `${getSite()}/${payload.slug}-${Date.now()}.pdf`;
            const { error: upErr } = await supabase.storage
                .from("article-pdfs")
                .upload(fileName, pdfFile, { contentType: "application/pdf", upsert: false });
            if (upErr) throw upErr;
            payload.pdf_path = fileName;
            payload.pdf_url = pdfPublicUrl(fileName);
        }

        let result;
        if (currentId) {
            result = await supabase.from("articles").update(payload).eq("id", currentId).select().single();
        } else {
            result = await supabase.from("articles").insert(payload).select().single();
        }
        if (result.error) throw result.error;

        currentId = result.data.id;
        setStatus("Saqlandi ✓", "ok");
        await loadArticles();
        await selectArticle(currentId);
    } catch (err) {
        setStatus(err.message || String(err), "err");
    } finally {
        submitBtn.disabled = false;
    }
});

document.getElementById("delete-btn").addEventListener("click", async () => {
    if (!currentId) return;
    if (!confirm("Ushbu maqola butunlay o'chirilsinmi?")) return;
    setStatus("O'chirilmoqda...", "info");
    const { data: current } = await supabase.from("articles").select("pdf_path").eq("id", currentId).single();
    const { error } = await supabase.from("articles").delete().eq("id", currentId);
    if (error) return setStatus(error.message, "err");
    if (current?.pdf_path) {
        await supabase.storage.from("article-pdfs").remove([current.pdf_path]);
    }
    currentId = null;
    showEditorEmpty();
    await loadArticles();
});

initAuth();
