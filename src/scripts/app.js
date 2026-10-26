// ===== Element references =====
const pageJumpForm = document.getElementById("page-jump-form");
const pageInput = document.getElementById("page-input");
const journalViewer = document.querySelector(".journal-viewer");
const viewModeButtons = document.querySelectorAll("[data-view-mode]");
const journalPageCounter = document.getElementById("journal-page-counter");
const journalNavButtons = document.querySelectorAll("[data-journal-nav]");
const journalStatus = document.getElementById("journal-status");
const bookShell = document.getElementById("book-shell");
const bookSpread = document.getElementById("book-spread");
const leftCanvas = document.getElementById("left-page-canvas");
const rightCanvas = document.getElementById("right-page-canvas");
const leftEmpty = document.getElementById("left-page-empty");
const rightEmpty = document.getElementById("right-page-empty");
const leftPageNumber = document.getElementById("left-page-number");
const rightPageNumber = document.getElementById("right-page-number");
const fullscreenToggle = document.getElementById("fullscreen-toggle");
const fullscreenExit = document.getElementById("fullscreen-exit");
const fullscreenPageCounter = document.getElementById("fullscreen-page-counter");
const fullscreenPageSlider = document.getElementById("fullscreen-page-slider");
const readerToneButtons = document.querySelectorAll("[data-reader-tone]");

const railNavLinks = [...document.querySelectorAll(".rail-nav a")];
const menuToggle = document.getElementById("menu-toggle");
const navScrim = document.getElementById("nav-scrim");

const archiveContainer = document.getElementById("archive-issues");
const pdfLink = document.getElementById("pdf-link");
const viewerCurrentIssue = document.getElementById("viewer-current-issue");

// All published issues, newest first.
const JOURNAL_ISSUES = [
    { year: 2026, issue: 5 },
    { year: 2026, issue: 4 },
    { year: 2026, issue: 3 },
    { year: 2026, issue: 2 },
    { year: 2026, issue: 1 },
    { year: 2025, issue: 2 },
    { year: 2025, issue: 1 }
].map((entry) => ({ ...entry, file: `/assets/journal/${entry.year}-${entry.issue}.pdf` }));

let currentIssue = JOURNAL_ISSUES[0];
let PDF_URL = currentIssue.file;
const PDF_PAGE_WIDTH = 595.276;
const PDF_PAGE_HEIGHT = 841.89;

// ===== State =====
let pdfDoc = null;
let totalPages = 0;
let spreadStart = 1;
let pdfLoadToken = 0;
let isRendering = false;
let queuedSpread = null;
let currentViewMode = window.innerWidth <= 780 ? "single" : "spread";
let readerTone = "normal";
let scrollPositionBeforeFullscreen = 0;

// ===== Editorial board data =====
const leadership = [
    { role: "Boş muharrir", name: "Sayfullayev Nodirbek Baxtiyorovich", degree: "Tarix fanlari nomzodi, professor" },
    { role: "Boş muharrir örinbosari", name: "Yakubov Baxtiyor Choriyevich", degree: "San'atşunoslik fanlari böyiça falsafa doktori (PhD), dotsent" },
    { role: "Mas'ul kotib", name: "Xolmuminova Nigora Xankulovna", degree: "" },
    { role: "Sahifalovçi dizayner", name: "Abdulg'oziyeva Ro'zigul Normurod qizi", degree: "" }
];

const council = [
    { name: "Ozodbek Nazarbekov", note: "Özbekiston Respublikasi Madaniyat vaziri, Özbekiston Respublikasi xalq artisti" },
    { name: "Shuhratilla Rizayev", note: "Kinematografiya agentligi direktori, filologiya fanlari nomzodi, professor" },
    { name: "Otabek Xasanov", note: "Respublika ma'naviyat va ma'rifat markazi direktori, siyosiy fanlar doktori (DSc)" },
    { name: "Yodgor Sa'diyev", note: "Özbek Milliy akademik drama teatri direktori, Özbekiston Respublikasi xalq artisti" },
    { name: "Nodira Mustafoyeva", note: "FA ijtimoiy-gumanitar fanlar bölimi boşliği, tarix fanlari doktori, professor" },
    { name: "Kamola Akilova", note: "Tasviriy san'at galereyasi direktori, Badiiy akademiya akademigi, san'atşunoslik fanlari doktori (DSc), professor" },
    { name: "Jannat Ismoilova", note: "Özbekiston tarixi davlat muzeyi direktori, tarix fanlari doktori, professor" },
    { name: "Umida Teshaboyeva", note: "Alişer Navoiy nomidagi Özbekiston milliy kutubxonasi direktori, tarix fanlari böyiça falsafa doktori (PhD)" },
    { name: "Sirojiddin Sayyid", note: "Özbekiston Yozuvçilar uyuşmasi raisi, Özbekiston xalq şoiri" },
    { name: "Rustam Abdullayev", note: "Özbekiston Bastakorlar uyuşmasi raisi, Özbekiston Respublikasi san'at arbobi" }
];

const board = [
    { name: "Muhabbat Tulyaxodjayeva", degree: "San'atşunoslik fanlari doktori, professor" },
    { name: "Sarvinoz Qodirova", degree: "San'atşunoslik fanlari doktori, professor" },
    { name: "Oltinoy Tojiboyeva", degree: "San'atşunoslik fanlari doktori, professor" },
    { name: "Guzal Xalikulova", degree: "San'atşunoslik fanlari doktori, professor" },
    { name: "Rustambek Abdullayev", degree: "Özbekiston Respublikasi san'at arbobi, san'atşunoslik fanlari doktori, professor" },
    { name: "Ravshan Yunusov", degree: "Özbekiston Respublikasi san'at arbobi, san'atşunoslik fanlari nomzodi, professor" },
    { name: "Akbar Xakimov", degree: "Fanlar akademiyasi va Badiiy akademiya akademigi, san'atşunoslik fanlari doktori, professor" },
    { name: "Nigora Axmedova", degree: "Badiiy akademiya akademigi, san'atşunoslik fanlari doktori, professor" },
    { name: "Abduxalil Mavrulov", degree: "Özbekistonda xizmat körsatgan yoşlar murabbiysi, tarix fanlari doktori, professor" },
    { name: "Sayyora Tuychiyeva", degree: "Falsafa fanlari doktori, professor" },
    { name: "Viktor Alemasov", degree: "Falsafa fanlari doktori, professor (v.b.)" },
    { name: "Marfua Xamidova", degree: "San'atşunoslik fanlari doktori, professor" },
    { name: "Dilafruz Qodirova", degree: "San'atşunoslik fanlari doktori, professor" },
    { name: "Ma'rufjon Yuldoshev", degree: "Filologiya fanlari doktori, professor" },
    { name: "Guzalxon Isakova", degree: "Filologiya fanlari doktori (DSc), dotsent" },
    { name: "Nilufar Isakulova", degree: "Pedagogika fanlari doktori (DSc), professor" },
    { name: "Muhammadjon Quronov", degree: "Pedagogika fanlari doktori, professor" },
    { name: "Absalom Umarov", degree: "Sotsiologiya fanlari doktori, professor" },
    { name: "Sevil Kerimova", degree: "San'atşunoslik fanlari böyiça falsafa doktori (PhD), dotsent" },
    { name: "Aziza Kurbanova", degree: "Pedagogika fanlari doktori (DSc), dotsent" },
    { name: "Zumriniso Kozimova", degree: "Filologiya fanlari böyiça falsafa doktori (PhD), dotsent" },
    { name: "Shahlo Hamidova", degree: "San'atşunoslik fanlari böyiça falsafa doktori" },
    { name: "Gulnoza Bobonazarova", degree: "Filologiya fanlari böyiça falsafa doktori" },
    { name: "Nasiba Turg'unova", degree: "San'atşunoslik fanlari böyiça falsafa doktori, dotsent" },
    { name: "Shoira Asadova", degree: "Tarix fanlari nomzodi, dotsent" },
    { name: "Muhayyo Muxtorova", degree: "San'atşunoslik fanlari böyiça falsafa doktori" },
    { name: "O'ktam Nosirov", degree: "Falsafa fanlari nomzodi, dotsent" },
    { name: "Zoya Arislanbayeva", degree: "Tarix fanlari nomzodi, dotsent" },
    { name: "Robiya Tursunmetova", degree: "San'atşunoslik fanlari böyiça falsafa doktori" },
    { name: "Aybek Kopadze", degree: "San'atşunoslik fanlari nomzodi, dotsent" },
    { name: "Oybek Davlatov", degree: "Pedagogika fanlari böyiça falsafa doktori (PhD)" }
];

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function renderBoard() {
    const leadersHost = document.getElementById("leadership-list");
    if (leadersHost) {
        leadership.forEach((person) => {
            const card = el("article", "leader");
            card.append(el("span", "leader-role", person.role));
            card.append(el("h4", "leader-name", person.name));
            if (person.degree) card.append(el("p", "leader-degree", person.degree));
            leadersHost.append(card);
        });
    }

    const renderPeople = (host, items) => {
        if (!host) return;
        items.forEach((person, index) => {
            const li = el("li", "person");
            li.append(el("span", "person-num", String(index + 1)));
            const body = el("div", "person-body");
            body.append(el("span", "person-name", person.name));
            const detail = person.degree || person.note;
            if (detail) body.append(el("span", "person-detail", detail));
            li.append(body);
            host.append(li);
        });
    };

    renderPeople(document.getElementById("council-list"), council);
    renderPeople(document.getElementById("board-list"), board);
}

// ===== Navigation: mobile drawer + scrollspy =====
function closeNav() {
    document.body.classList.remove("nav-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
}

if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        const open = document.body.classList.toggle("nav-open");
        menuToggle.setAttribute("aria-expanded", String(open));
    });
}

if (navScrim) {
    navScrim.addEventListener("click", closeNav);
}

// ===== Tabbed sections =====
const tabSections = [...document.querySelectorAll(".main .sec")];

function resolveSectionId(hash) {
    const id = (hash || "").replace(/^#/, "");
    return tabSections.some((section) => section.id === id)
        ? id
        : (tabSections[0] ? tabSections[0].id : "");
}

function activateSection(id, { scroll = true } = {}) {
    const targetId = resolveSectionId(`#${id}`);
    const target = tabSections.find((section) => section.id === targetId);
    if (!target) return;

    tabSections.forEach((section) => {
        section.classList.toggle("is-active", section === target);
    });
    railNavLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${targetId}`);
    });

    if (targetId === "arxiv") {
        requestAnimationFrame(() => renderSpread(spreadStart || 1));
    }

    if (scroll) {
        window.scrollTo(0, 0);
    }
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const id = link.getAttribute("href").slice(1);
    if (!id || !tabSections.some((section) => section.id === id)) return;

    link.addEventListener("click", (event) => {
        event.preventDefault();
        if (window.innerWidth <= 960) {
            closeNav();
        }
        if (location.hash !== `#${id}`) {
            history.pushState(null, "", `#${id}`);
        }
        activateSection(id);
    });
});

window.addEventListener("popstate", () => {
    activateSection(resolveSectionId(location.hash), { scroll: false });
});

activateSection(resolveSectionId(location.hash), { scroll: false });

// ===== PDF viewer =====
function clampPage(page) {
    if (!totalPages) {
        return 1;
    }
    return Math.max(1, Math.min(totalPages, page));
}

function isSinglePageMode() {
    return currentViewMode === "single";
}

function normalizePageForMode(page, singlePageMode = isSinglePageMode()) {
    const normalized = clampPage(page);
    return singlePageMode ? normalized : (normalized % 2 === 0 ? normalized - 1 : normalized);
}

function syncViewModeUI() {
    const singleMode = isSinglePageMode();
    bookShell.classList.toggle("is-single-view", singleMode);
    bookShell.classList.toggle("is-spread-view", !singleMode);

    viewModeButtons.forEach((button) => {
        const isActive = button.dataset.viewMode === currentViewMode;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

function syncReaderControls() {
    if (fullscreenPageSlider) {
        fullscreenPageSlider.max = String(totalPages || 1);
        fullscreenPageSlider.value = String(Number(pageInput.value) || spreadStart || 1);
    }

    readerToneButtons.forEach((button) => {
        const isActive = button.dataset.readerTone === readerTone;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    bookShell.classList.toggle("reader-tone-soft", readerTone === "soft");
    bookShell.classList.toggle("reader-tone-dark", readerTone === "dark");
}

function getScaleForPage(page, canvas, singlePageMode) {
    const isFullscreen = bookShell.classList.contains("is-fullscreen-active")
        || document.fullscreenElement === bookShell
        || document.webkitFullscreenElement === bookShell;
    const parentWidth = canvas.parentElement?.clientWidth || 0;
    const parentHeight = canvas.parentElement?.clientHeight || 0;
    const spreadWidth = bookSpread.clientWidth || bookShell.clientWidth || 1200;
    const fallbackWidth = singlePageMode ? spreadWidth : Math.floor(spreadWidth / 2);
    let containerWidth = parentWidth || fallbackWidth || 600;
    let containerHeight = parentHeight || Math.round(containerWidth * (PDF_PAGE_HEIGHT / PDF_PAGE_WIDTH));

    if (isFullscreen) {
        const maxSpreadWidth = singlePageMode ? 900 : 1480;
        const maxPageWidth = singlePageMode ? maxSpreadWidth : Math.floor(maxSpreadWidth / 2);
        containerWidth = Math.min(containerWidth, maxPageWidth);
    }

    const baseViewport = page.getViewport({ scale: 1 });
    const horizontalPadding = isFullscreen ? (singlePageMode ? 24 : 16) : (singlePageMode ? 28 : 18);
    const verticalPadding = isFullscreen ? 36 : 8;
    const availableWidth = Math.max(120, containerWidth - horizontalPadding);
    const availableHeight = Math.max(160, containerHeight - verticalPadding);
    const widthScale = availableWidth / baseViewport.width;
    const heightScale = availableHeight / baseViewport.height;
    return Math.min(widthScale, heightScale);
}

async function renderProcessedPage(pageNumber, canvas, singlePageMode) {
    const page = await pdfDoc.getPage(pageNumber);
    const scale = getScaleForPage(page, canvas, singlePageMode);
    const viewport = page.getViewport({ scale });
    const outputScale = window.devicePixelRatio || 1;
    const targetContext = canvas.getContext("2d");

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    targetContext.setTransform(outputScale, 0, 0, outputScale, 0, 0);
    targetContext.clearRect(0, 0, viewport.width, viewport.height);

    await page.render({
        canvasContext: targetContext,
        viewport
    }).promise;
}

async function preparePageCanvas(pageNumber, singlePageMode) {
    if (pageNumber < 1 || pageNumber > totalPages) {
        return null;
    }

    const preparedCanvas = document.createElement("canvas");
    await renderProcessedPage(pageNumber, preparedCanvas, singlePageMode);
    return preparedCanvas;
}

function commitPreparedCanvas(preparedCanvas, canvas, emptyNode, numberNode, pageNumber) {
    const context = canvas.getContext("2d");

    if (!preparedCanvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = "none";
        canvas.style.removeProperty("width");
        canvas.style.removeProperty("height");
        emptyNode.style.display = "flex";
        numberNode.textContent = "";
        return;
    }

    canvas.width = preparedCanvas.width;
    canvas.height = preparedCanvas.height;
    canvas.style.width = preparedCanvas.style.width;
    canvas.style.height = preparedCanvas.style.height;
    context.clearRect(0, 0, preparedCanvas.width, preparedCanvas.height);
    context.drawImage(preparedCanvas, 0, 0);
    canvas.style.display = "block";
    emptyNode.style.display = "none";
    numberNode.textContent = String(pageNumber);
}

async function renderPdfPage(pageNumber, canvas, emptyNode, numberNode, singlePageMode) {
    const preparedCanvas = await preparePageCanvas(pageNumber, singlePageMode);
    commitPreparedCanvas(preparedCanvas, canvas, emptyNode, numberNode, pageNumber);
}

function updateViewerMeta(normalizedStart, rightPage, singlePageMode) {
    spreadStart = normalizedStart;
    pageInput.max = String(totalPages);
    pageInput.value = String(singlePageMode ? rightPage : normalizedStart);
    journalPageCounter.textContent = singlePageMode
        ? `${rightPage} / ${totalPages}`
        : `${normalizedStart}-${Math.min(totalPages, rightPage)} / ${totalPages}`;
    fullscreenPageCounter.textContent = journalPageCounter.textContent;
    journalStatus.textContent = "";
    syncReaderControls();
}

async function renderSpread(startPage) {
    if (!pdfDoc) {
        return;
    }

    if (!bookShell.clientWidth) {
        spreadStart = normalizePageForMode(startPage);
        return;
    }

    if (isRendering) {
        queuedSpread = startPage;
        return;
    }

    isRendering = true;
    const singlePageMode = isSinglePageMode();
    const normalizedStart = normalizePageForMode(startPage, singlePageMode);
    const leftPage = singlePageMode ? 0 : normalizedStart;
    const rightPage = singlePageMode ? normalizedStart : normalizedStart + 1;

    try {
        await renderPdfPage(leftPage, leftCanvas, leftEmpty, leftPageNumber, singlePageMode);
        await renderPdfPage(rightPage, rightCanvas, rightEmpty, rightPageNumber, singlePageMode);
        updateViewerMeta(normalizedStart, rightPage, singlePageMode);
    } catch (error) {
        journalStatus.textContent = "PDF sahifasini ko'rsatib bo'lmadi";
        console.error(error);
    } finally {
        isRendering = false;
        if (queuedSpread !== null) {
            const pendingSpread = queuedSpread;
            queuedSpread = null;
            renderSpread(pendingSpread);
        }
    }
}

function moveJournal(direction) {
    const step = isSinglePageMode() ? 1 : 2;
    const targetSpread = spreadStart + direction * step;
    renderSpread(targetSpread);
}

function setFullscreenStyles(active) {
    const background = readerTone === "dark" ? "#0e1a2b" : readerTone === "soft" ? "#f6efdf" : "#fff";
    const nodes = [
        bookShell,
        bookSpread,
        document.getElementById("left-page"),
        document.getElementById("right-page")
    ].filter(Boolean);

    nodes.forEach((node) => {
        if (!active) {
            node.style.removeProperty("background");
            node.style.removeProperty("background-color");
            node.style.removeProperty("background-image");
            node.style.removeProperty("box-shadow");
            return;
        }

        node.style.setProperty("background", background, "important");
        node.style.setProperty("background-color", background, "important");
        node.style.setProperty("background-image", "none", "important");
        node.style.setProperty("box-shadow", "none", "important");
    });

    syncReaderControls();
}

async function toggleFullscreen() {
    const activeFullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;

    if (!activeFullscreenElement) {
        scrollPositionBeforeFullscreen = window.scrollY || window.pageYOffset || 0;

        if (bookShell.requestFullscreen) {
            await bookShell.requestFullscreen();
            return;
        }

        if (bookShell.webkitRequestFullscreen) {
            bookShell.webkitRequestFullscreen();
        }
        return;
    }

    if (document.exitFullscreen) {
        await document.exitFullscreen();
        return;
    }

    if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

function syncFullscreenButton() {
    const activeFullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    const isFullscreen = activeFullscreenElement === bookShell;
    bookShell.classList.toggle("is-fullscreen-active", isFullscreen);
    setFullscreenStyles(isFullscreen);
    fullscreenToggle.textContent = isFullscreen ? "Oddiy ekran" : "To'liq ekran";
}

function restoreJournalScrollAfterFullscreen() {
    const targetTop = journalViewer
        ? journalViewer.getBoundingClientRect().top + window.scrollY - 18
        : scrollPositionBeforeFullscreen;
    const targetScroll = Math.max(0, Math.min(scrollPositionBeforeFullscreen || targetTop, targetTop));

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            window.scrollTo({ top: targetScroll, left: 0, behavior: "auto" });
        });
    });
}

function setViewMode(mode) {
    if (mode !== "single" && mode !== "spread") {
        return;
    }

    if (currentViewMode === mode) {
        return;
    }

    const currentPage = Number(pageInput.value) || spreadStart || 1;
    currentViewMode = mode;
    syncViewModeUI();

    if (pdfDoc) {
        renderSpread(currentPage);
    }
}

journalNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const direction = button.dataset.journalNav === "next" ? 1 : -1;
        moveJournal(direction);
    });
});

viewModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setViewMode(button.dataset.viewMode);
    });
});

pageJumpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const targetPage = Number(pageInput.value);
    if (!Number.isFinite(targetPage) || targetPage < 1) {
        return;
    }
    renderSpread(targetPage);
});

async function handleFullscreenToggleClick() {
    try {
        await toggleFullscreen();
    } catch (error) {
        console.error(error);
    }
}

fullscreenToggle.addEventListener("click", handleFullscreenToggleClick);
fullscreenExit.addEventListener("click", handleFullscreenToggleClick);

readerToneButtons.forEach((button) => {
    button.addEventListener("click", () => {
        readerTone = readerTone === button.dataset.readerTone ? "normal" : button.dataset.readerTone;
        setFullscreenStyles(bookShell.classList.contains("is-fullscreen-active"));
    });
});

fullscreenPageSlider.addEventListener("input", () => {
    pageInput.value = fullscreenPageSlider.value;
});

fullscreenPageSlider.addEventListener("change", () => {
    renderSpread(Number(fullscreenPageSlider.value));
});

window.addEventListener("resize", () => {
    if (pdfDoc) {
        renderSpread(spreadStart);
    }

    if (window.innerWidth > 960) {
        closeNav();
    }
});

function handleFullscreenChange() {
    const wasFullscreen = bookShell.classList.contains("is-fullscreen-active");
    syncFullscreenButton();
    const isFullscreen = bookShell.classList.contains("is-fullscreen-active");

    if (wasFullscreen && !isFullscreen) {
        restoreJournalScrollAfterFullscreen();
    }

    if (pdfDoc) {
        renderSpread(spreadStart);
    }
}

document.addEventListener("fullscreenchange", handleFullscreenChange);
document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

document.addEventListener("keydown", (event) => {
    const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName);

    if (isTyping) {
        return;
    }

    if (event.key === "ArrowLeft") {
        moveJournal(-1);
    }

    if (event.key === "ArrowRight") {
        moveJournal(1);
    }
});

async function loadPdf() {
    if (!window.pdfjsLib) {
        journalStatus.textContent = "PDF kutubxonasi yuklanmadi";
        return;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = "/assets/vendor/pdf.worker.min.js";

    // Each load bumps a token; only the latest request renders, so picking
    // another issue before the current PDF finishes doesn't leave a stale page.
    const myToken = ++pdfLoadToken;
    pdfDoc = null;
    totalPages = 0;
    spreadStart = 1;
    journalStatus.textContent = "PDF yuklanmoqda...";

    try {
        const loadingTask = pdfjsLib.getDocument(PDF_URL);
        const loadedDoc = await loadingTask.promise;
        if (myToken !== pdfLoadToken) {
            loadedDoc.destroy();
            return;
        }
        pdfDoc = loadedDoc;
        totalPages = loadedDoc.numPages;
        pageInput.max = String(totalPages);
        await renderSpread(1);
    } catch (error) {
        if (myToken === pdfLoadToken) {
            journalStatus.textContent = "PDF faylni ochib bo'lmadi";
        }
        console.error(error);
    }
}

function formatIssueLabel(entry) {
    return `${entry.year}-yil, ${entry.issue}-son`;
}

function syncCurrentIssueLabel() {
    if (viewerCurrentIssue) {
        viewerCurrentIssue.textContent = formatIssueLabel(currentIssue);
    }
    if (pdfLink) {
        pdfLink.href = currentIssue.file;
    }
    if (archiveContainer) {
        archiveContainer.querySelectorAll(".issue-chip").forEach((chip) => {
            const active = chip.dataset.file === currentIssue.file;
            chip.classList.toggle("is-active", active);
            chip.setAttribute("aria-pressed", String(active));
        });
    }
}

async function selectIssue(entry, { scroll = false } = {}) {
    currentIssue = entry;
    PDF_URL = entry.file;
    syncCurrentIssueLabel();
    if (scroll && journalViewer) {
        journalViewer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    await loadPdf();
}

function renderArchive() {
    if (!archiveContainer) {
        return;
    }

    archiveContainer.innerHTML = "";

    const years = [...new Set(JOURNAL_ISSUES.map((entry) => entry.year))];

    years.forEach((year) => {
        const yearBlock = document.createElement("div");
        yearBlock.className = "archive-year";

        const label = document.createElement("div");
        label.className = "archive-year-label";
        label.textContent = String(year);

        const issues = document.createElement("div");
        issues.className = "archive-year-issues";

        JOURNAL_ISSUES
            .filter((entry) => entry.year === year)
            .forEach((entry) => {
                const chip = document.createElement("button");
                chip.type = "button";
                chip.className = "issue-chip";
                chip.dataset.file = entry.file;
                chip.setAttribute("aria-pressed", "false");
                chip.textContent = `${entry.issue}-son`;
                chip.addEventListener("click", () => selectIssue(entry, { scroll: true }));
                issues.append(chip);
            });

        yearBlock.append(label, issues);
        archiveContainer.append(yearBlock);
    });

    syncCurrentIssueLabel();
}

// ===== Init =====
renderBoard();
renderArchive();
selectIssue(currentIssue);
syncFullscreenButton();
syncViewModeUI();
syncReaderControls();

// Public articles listing (Supabase-backed).
import("./articles-public.js")
    .then((mod) => mod.initArticlesPublic())
    .catch((err) => console.warn("[articles-public]", err));
