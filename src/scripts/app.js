const navButtons = document.querySelectorAll(".nav-button");
const panels = document.querySelectorAll(".tab-panel");
const breadcrumbCurrent = document.getElementById("breadcrumb-current");
const mobileNavToggle = document.getElementById("mobile-nav-toggle");
const sidebar = document.getElementById("sidebar");
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
const languageButtons = document.querySelectorAll("[data-lang]");
const languageShortLinks = document.querySelectorAll("[data-lang-short]");

const PDF_URL = "/assets/journal/madaniyat-sanat-3-son.pdf";
const PDF_PAGE_WIDTH = 595.276;
const PDF_PAGE_HEIGHT = 841.89;

const translations = {
    uz: {
        htmlLang: "uz",
        pageTitle: "OʻzDSMI",
        heroTitle: "Tadqiqotlar, maqolalar va ilmiy muloqot uchun zamonaviy jurnal makoni",
        noticeText: "Joriy son — 3-son, 2025-yil. PDF nashr endi onlayn mavjud.",
        navAbout: "Jurnal haqida",
        navRequirements: "Talablar",
        navArchive: "Arxiv",
        navEditorial: "Redkollegiya",
        breadcrumbHome: "Asosiy sahifa",
        breadcrumbJournal: "Jurnal",
        aboutTitle: "Jurnal faoliyati va maqsadi",
        aboutIntro: "OʻzDSMI jurnali sanʼatshunoslik, madaniyatshunoslik va ijodiy tadqiqotlar sohasidagi ilmiy maqolalarni nashr etadi.",
        aboutCopyOne: "Nashr Oʻzbekiston va xorijlik mualliflarning ilmiy ishlarini, sharhlarni, suhbatlarni va arxiv materiallarini birlashtiradi.",
        aboutCopyTwo: "Jurnal Oliy attestatsiya komissiyasi roʻyxatiga kiritilgan va mintaqaviy madaniy meros boʻyicha bilim almashish maydonchasi boʻlib xizmat qiladi.",
        periodicity: "Davriyligi",
        periodicityValue: "Choraklik (yiliga 4 marta)",
        languages: "Tillar",
        languagesValue: "Oʻzbek, rus, ingliz",
        format: "Nashr formati",
        formatValue: "Elektron PDF va veb-arxiv",
        journal: "Jurnal",
        viewerTitle: "Soʻnggi sonni koʻrish",
        fullscreen: "Toʻliq ekran",
        exitFullscreen: "Oddiy ekran",
        singlePage: "1 sahifa",
        twoPages: "2 sahifa",
        page: "Sahifa",
        open: "Ochish",
        pdfLoading: "PDF yuklanmoqda...",
        pdfLibraryError: "PDF kutubxonasi yuklanmadi",
        pdfOpenError: "PDF faylni ochib boʻlmadi",
        pdfRenderError: "PDF ochilmadi",
        emptyPage: "Boʻsh sahifa",
        openPdf: "PDF ochish",
        softMode: "Yumshoq",
        darkMode: "Tungi",
        requirementsTitle: "Mualliflar uchun asosiy talablar",
        requirementsIntro: "Maqolalar quyidagi shakl va mazmun talablariga muvofiq taqdim etiladi.",
        reqOne: "1. Matn hajmi",
        reqOneDesc: "8–15 sahifa, A4, 12 kegl, 1.5 interval.",
        reqTwo: "2. Tuzilishi",
        reqTwoDesc: "Kirish, asosiy qism, xulosa, foydalanilgan adabiyotlar roʻyxati.",
        reqThree: "3. Til talabi",
        reqThreeDesc: "Oʻzbek, rus yoki ingliz tillarida; annotatsiya uchta tilda.",
        reqFour: "4. Format",
        reqFourDesc: "DOCX yoki RTF, rasmlar 300 dpi, alohida fayl sifatida.",
        reqPointOne: "Mualliflar haqida toʻliq maʼlumot va ORCID identifikatori.",
        reqPointTwo: "UDK indeksi va kalit soʻzlar (kamida 5 ta).",
        reqPointThree: "Foydalanilgan adabiyotlar roʻyxati ISO 690 standartida.",
        reqPointFour: "Plagiat darajasi 25% dan oshmasligi shart.",
        archiveTitle: "Jurnal arxivi",
        archiveIntro: "Barcha sonlar ochiq kirish rejimida mavjud. Quyidagi roʻyxatdan kerakli sonni tanlang.",
        archiveIssueA: "3-son",
        archiveItemA1: "Mavzu: Zamonaviy oʻzbek sanʼati va xalqaro kontekst.",
        archiveItemA2: "12 ta ilmiy maqola, 4 ta sharh.",
        archiveIssueB: "2-son",
        archiveItemB1: "Mavzu: Teatr va kino: anʼanalar va innovatsiyalar.",
        archiveItemB2: "10 ta ilmiy maqola, 3 ta sharh.",
        archiveIssueC: "4-son",
        archiveItemC1: "Mavzu: Musiqa merosi va etnomusikashunoslik.",
        archiveItemC2: "11 ta ilmiy maqola, 2 ta tarjima.",
        editorialTitle: "Redkollegiya tarkibi",
        editorialIntro: "Jurnalning ilmiy yoʻnalishini Oʻzbekiston va xorijning yetakchi mutaxassislari belgilab beradi.",
        chiefEditor: "Bosh muharrir",
        deputyEditor: "Muharrir oʻrinbosari",
        secretary: "Masʼul kotib",
        technicalEditor: "Texnik muharrir",
        editorOne: "Madaniyatshunoslik va sanʼat tarixi boʻyicha 25 yillik tajriba.",
        editorTwo: "Anʼanaviy musiqa va etnomusikashunoslik tadqiqotchisi.",
        editorThree: "Teatr va sahna sanʼati boʻyicha mutaxassis.",
        editorFour: "Zamonaviy sanʼat va vizual madaniyat yoʻnalishi.",
        sideCurrentIssue: "Joriy son",
        sideIssueText: "3-son, 2025-yil",
        sideIssueDate: "Nashr sanasi: oktyabr 2025",
        sideIssueArticles: "12 ta ilmiy maqola",
        sideIssueTheme: "Mavzu: Zamonaviy sanʼat va kontekst",
        sideSubmission: "Maqola yuborish",
        sideLinks: "Tezkor havolalar",
        sideContacts: "Aloqa",
        sideAddress: "Toshkent sh., Oʻzbekiston"
    },
    ru: {
        htmlLang: "ru",
        pageTitle: "OʻzDSMI",
        heroTitle: "Современное журнальное пространство для исследований культуры и искусства",
        noticeText: "Текущий выпуск — №3, 2025 год. PDF-версия теперь доступна онлайн.",
        navAbout: "О журнале",
        navRequirements: "Требования",
        navArchive: "Архив",
        navEditorial: "Редколлегия",
        breadcrumbHome: "Главная",
        breadcrumbJournal: "Журнал",
        aboutTitle: "Деятельность и цель журнала",
        aboutIntro: "Журнал «Культура и искусство» публикует научные статьи в области искусствоведения, культурологии и творческих исследований.",
        aboutCopyOne: "Издание объединяет работы авторов из Узбекистана и зарубежья: научные статьи, обзоры, интервью и архивные материалы.",
        aboutCopyTwo: "Журнал включён в реестр Высшей аттестационной комиссии и служит площадкой для обмена знаниями в сфере регионального культурного наследия.",
        periodicity: "Периодичность",
        periodicityValue: "Ежеквартально (4 раза в год)",
        languages: "Языки",
        languagesValue: "Узбекский, русский, английский",
        format: "Формат издания",
        formatValue: "Электронный PDF и веб-архив",
        journal: "Журнал",
        viewerTitle: "Просмотр последнего выпуска",
        fullscreen: "Полный экран",
        exitFullscreen: "Обычный экран",
        singlePage: "1 страница",
        twoPages: "2 страницы",
        page: "Страница",
        open: "Открыть",
        pdfLoading: "PDF загружается...",
        pdfLibraryError: "PDF-библиотека не загрузилась",
        pdfOpenError: "Не удалось открыть PDF-файл",
        pdfRenderError: "PDF не открылся",
        emptyPage: "Пустая страница",
        openPdf: "Открыть PDF",
        softMode: "Мягкий",
        darkMode: "Ночной",
        requirementsTitle: "Основные требования для авторов",
        requirementsIntro: "Статьи представляются в соответствии со следующими требованиями к форме и содержанию.",
        reqOne: "1. Объём текста",
        reqOneDesc: "8–15 страниц, A4, 12 кегль, интервал 1.5.",
        reqTwo: "2. Структура",
        reqTwoDesc: "Введение, основная часть, заключение, список литературы.",
        reqThree: "3. Языковое требование",
        reqThreeDesc: "Узбекский, русский или английский; аннотация на трёх языках.",
        reqFour: "4. Формат",
        reqFourDesc: "DOCX или RTF, изображения 300 dpi, отдельным файлом.",
        reqPointOne: "Полные сведения об авторах и идентификатор ORCID.",
        reqPointTwo: "Индекс УДК и ключевые слова (не менее 5).",
        reqPointThree: "Список литературы по стандарту ISO 690.",
        reqPointFour: "Уровень плагиата не должен превышать 25%.",
        archiveTitle: "Архив журнала",
        archiveIntro: "Все выпуски находятся в открытом доступе. Выберите нужный из списка ниже.",
        archiveIssueA: "Выпуск 3",
        archiveItemA1: "Тема: Современное узбекское искусство и международный контекст.",
        archiveItemA2: "12 научных статей, 4 обзора.",
        archiveIssueB: "Выпуск 2",
        archiveItemB1: "Тема: Театр и кино: традиции и инновации.",
        archiveItemB2: "10 научных статей, 3 обзора.",
        archiveIssueC: "Выпуск 4",
        archiveItemC1: "Тема: Музыкальное наследие и этномузыковедение.",
        archiveItemC2: "11 научных статей, 2 перевода.",
        editorialTitle: "Состав редколлегии",
        editorialIntro: "Научное направление журнала определяют ведущие специалисты Узбекистана и зарубежья.",
        chiefEditor: "Главный редактор",
        deputyEditor: "Заместитель редактора",
        secretary: "Ответственный секретарь",
        technicalEditor: "Технический редактор",
        editorOne: "25 лет опыта в области культурологии и истории искусств.",
        editorTwo: "Исследователь традиционной музыки и этномузыковедения.",
        editorThree: "Специалист по театру и сценическому искусству.",
        editorFour: "Направление современного искусства и визуальной культуры.",
        sideCurrentIssue: "Текущий выпуск",
        sideIssueText: "№3, 2025 год",
        sideIssueDate: "Дата выпуска: октябрь 2025",
        sideIssueArticles: "12 научных статей",
        sideIssueTheme: "Тема: Современное искусство и контекст",
        sideSubmission: "Отправить статью",
        sideLinks: "Быстрые ссылки",
        sideContacts: "Контакты",
        sideAddress: "г. Ташкент, Узбекистан"
    },
    en: {
        htmlLang: "en",
        pageTitle: "OʻzDSMI",
        heroTitle: "A modern journal space for culture and art research",
        noticeText: "Current issue — №3, 2025. The PDF edition is now available online.",
        navAbout: "About Journal",
        navRequirements: "Requirements",
        navArchive: "Archive",
        navEditorial: "Editorial Board",
        breadcrumbHome: "Home",
        breadcrumbJournal: "Journal",
        aboutTitle: "Journal activity and purpose",
        aboutIntro: "OʻzDSMI publishes scholarly articles in art studies, cultural studies and creative research.",
        aboutCopyOne: "The journal brings together works by Uzbek and international authors: papers, reviews, interviews and archival materials.",
        aboutCopyTwo: "The publication is on the Higher Attestation Commission registry and serves as a venue for knowledge exchange around regional cultural heritage.",
        periodicity: "Periodicity",
        periodicityValue: "Quarterly (4 issues per year)",
        languages: "Languages",
        languagesValue: "Uzbek, Russian, English",
        format: "Publication format",
        formatValue: "Electronic PDF and web archive",
        journal: "Journal",
        viewerTitle: "View the latest issue",
        fullscreen: "Fullscreen",
        exitFullscreen: "Exit fullscreen",
        singlePage: "1 page",
        twoPages: "2 pages",
        page: "Page",
        open: "Open",
        pdfLoading: "PDF loading...",
        pdfLibraryError: "PDF library failed to load",
        pdfOpenError: "Could not open PDF file",
        pdfRenderError: "PDF could not be opened",
        emptyPage: "Empty page",
        openPdf: "Open PDF",
        softMode: "Soft",
        darkMode: "Night",
        requirementsTitle: "Main requirements for authors",
        requirementsIntro: "Manuscripts are submitted in line with the following formal and content requirements.",
        reqOne: "1. Text length",
        reqOneDesc: "8–15 pages, A4, 12 pt, 1.5 line spacing.",
        reqTwo: "2. Structure",
        reqTwoDesc: "Introduction, main body, conclusion, list of references.",
        reqThree: "3. Language requirement",
        reqThreeDesc: "Uzbek, Russian or English; abstract in three languages.",
        reqFour: "4. Format",
        reqFourDesc: "DOCX or RTF, images 300 dpi as separate files.",
        reqPointOne: "Full author information and ORCID identifier.",
        reqPointTwo: "UDC index and keywords (at least 5).",
        reqPointThree: "Reference list following the ISO 690 standard.",
        reqPointFour: "Plagiarism level must not exceed 25%.",
        archiveTitle: "Journal archive",
        archiveIntro: "All issues are open-access. Pick the one you need from the list below.",
        archiveIssueA: "Issue 3",
        archiveItemA1: "Theme: Contemporary Uzbek art and the international context.",
        archiveItemA2: "12 papers, 4 reviews.",
        archiveIssueB: "Issue 2",
        archiveItemB1: "Theme: Theatre and cinema: tradition and innovation.",
        archiveItemB2: "10 papers, 3 reviews.",
        archiveIssueC: "Issue 4",
        archiveItemC1: "Theme: Musical heritage and ethnomusicology.",
        archiveItemC2: "11 papers, 2 translations.",
        editorialTitle: "Editorial board",
        editorialIntro: "The journal's academic direction is shaped by leading specialists from Uzbekistan and abroad.",
        chiefEditor: "Editor-in-Chief",
        deputyEditor: "Deputy Editor",
        secretary: "Executive Secretary",
        technicalEditor: "Technical Editor",
        editorOne: "25 years of experience in cultural studies and art history.",
        editorTwo: "Researcher of traditional music and ethnomusicology.",
        editorThree: "Specialist in theatre and performing arts.",
        editorFour: "Contemporary art and visual culture.",
        sideCurrentIssue: "Current issue",
        sideIssueText: "Issue 3, 2025",
        sideIssueDate: "Release: October 2025",
        sideIssueArticles: "12 papers",
        sideIssueTheme: "Theme: Contemporary art and context",
        sideSubmission: "Submit article",
        sideLinks: "Quick links",
        sideContacts: "Contact",
        sideAddress: "Tashkent, Uzbekistan"
    }
};

let pdfDoc = null;
let totalPages = 0;
let spreadStart = 1;
let isRendering = false;
let queuedSpread = null;
let currentViewMode = window.innerWidth <= 780 ? "single" : "spread";
let currentLanguage = localStorage.getItem("madaniyatLanguage") || "uz";
let readerTone = "normal";
let scrollPositionBeforeFullscreen = 0;

function t(key) {
    return translations[currentLanguage]?.[key] || translations.uz[key] || key;
}

function getCurrentPanel() {
    return document.querySelector(".tab-panel.active") || document.getElementById("jurnal-haqida");
}

function updateBreadcrumb() {
    const currentPanel = getCurrentPanel();
    const labelKey = currentPanel?.dataset.labelKey || "navAbout";
    breadcrumbCurrent.textContent = t(labelKey);
}

function setLanguage(language) {
    currentLanguage = translations[language] ? language : "uz";
    localStorage.setItem("madaniyatLanguage", currentLanguage);
    document.documentElement.lang = t("htmlLang");
    document.title = t("pageTitle");

    document.querySelectorAll("[data-i18n]").forEach((node) => {
        node.textContent = t(node.dataset.i18n);
    });

    panels.forEach((panel) => {
        panel.dataset.label = t(panel.dataset.labelKey || "navAbout");
    });

    languageButtons.forEach((button) => {
        const isActive = button.dataset.lang === currentLanguage;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    updateBreadcrumb();
    syncFullscreenButton();

    if (pdfDoc) {
        journalStatus.textContent = "";
    }
}

function openTab(targetId) {
    const nextPanel = document.getElementById(targetId);

    if (!nextPanel) {
        return;
    }

    navButtons.forEach((button) => {
        const isActive = button.dataset.tab === targetId;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    panels.forEach((panel) => {
        panel.classList.toggle("active", panel.id === targetId);
    });

    updateBreadcrumb();
    window.history.replaceState(null, "", `#${targetId}`);

    if (window.innerWidth <= 900) {
        document.body.classList.remove("nav-open");
    }
}

navButtons.forEach((button) => {
    button.addEventListener("click", () => {
        openTab(button.dataset.tab);
    });
});

languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setLanguage(button.dataset.lang);
    });
});

languageShortLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        setLanguage(link.dataset.langShort);
    });
});

function openTabFromHash() {
    const hashTab = window.location.hash.replace("#", "");
    if (hashTab) {
        openTab(hashTab);
    }
}

openTabFromHash();
window.addEventListener("hashchange", openTabFromHash);

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
        journalStatus.textContent = t("pdfRenderError");
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
    fullscreenToggle.textContent = isFullscreen ? t("exitFullscreen") : t("fullscreen");
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

mobileNavToggle.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
});

document.addEventListener("click", (event) => {
    if (window.innerWidth > 900 || !document.body.classList.contains("nav-open")) {
        return;
    }

    if (sidebar.contains(event.target) || mobileNavToggle.contains(event.target)) {
        return;
    }

    document.body.classList.remove("nav-open");
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

    if (window.innerWidth > 900) {
        document.body.classList.remove("nav-open");
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
        journalStatus.textContent = t("pdfLibraryError");
        return;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = "/assets/vendor/pdf.worker.min.js";

    try {
        const loadingTask = pdfjsLib.getDocument(PDF_URL);
        pdfDoc = await loadingTask.promise;
        totalPages = pdfDoc.numPages;
        pageInput.max = String(totalPages);
        await renderSpread(1);
    } catch (error) {
        journalStatus.textContent = t("pdfOpenError");
        console.error(error);
    }
}

setLanguage(currentLanguage);
loadPdf();
syncFullscreenButton();
syncViewModeUI();
syncReaderControls();
