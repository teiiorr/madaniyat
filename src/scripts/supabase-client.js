import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
    console.warn(
        "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set. " +
        "Copy SUPABASE_SETUP.md and create .env.local."
    );
}

// The unified admin panel (admin.uzsiac-bulletin.uz) manages both sites.
// currentSite is mutable — the UI switches between "journal" and "madaniyat".
// Default site is "journal" if nothing is stored.
export const SITES = [
    { id: "journal", label: "O'zDSMI xabarlari", short: "Journal" },
    { id: "madaniyat", label: "O'zbekiston madaniyati va san'ati", short: "Madaniyat" }
];

let currentSite = localStorage.getItem("admin-active-site") || "journal";
if (!SITES.some(s => s.id === currentSite)) currentSite = "journal";

export function getSite() { return currentSite; }

export function setSite(id) {
    if (!SITES.some(s => s.id === id)) return;
    currentSite = id;
    localStorage.setItem("admin-active-site", id);
}

// Public-facing consumers (article-public listing) still want a fixed site.
// Keep exported SITE constant for BC — resolves to "journal" for the journal
// project's own public code path.
export const SITE = "madaniyat";

export const supabase = createClient(url ?? "https://placeholder.supabase.co", anonKey ?? "placeholder", {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "sb-uzsiac-auth"
    }
});

export function slugify(input) {
    return String(input || "")
        .toLowerCase()
        .replace(/['`]/g, "")
        .replace(/[ʻʼ‘’]/g, "")
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
}

export function pdfPublicUrl(path) {
    if (!path) return null;
    const { data } = supabase.storage.from("article-pdfs").getPublicUrl(path);
    return data?.publicUrl ?? null;
}
