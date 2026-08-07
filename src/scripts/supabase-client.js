import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
    console.warn(
        "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set. " +
        "Copy SUPABASE_SETUP.md and create .env.local."
    );
}

export const SITE = "madaniyat";

export const supabase = createClient(url ?? "https://placeholder.supabase.co", anonKey ?? "placeholder", {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: `sb-${SITE}-auth`
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
