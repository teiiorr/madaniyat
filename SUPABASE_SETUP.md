# Supabase setup — admin panel for Maqolalar

Both `uzsiac-news.uz` (journal) and `uzsiac-journal.uz` (madaniyat) share a single
Supabase project. Articles are distinguished by the `site` column (`journal` |
`madaniyat`). PDFs live in a public storage bucket.

## 1. Create a Supabase project

1. Sign up at https://supabase.com (free tier is enough — 500MB DB, 1GB storage).
2. **New project** → choose a name (e.g. `uzsiac`), region **Frankfurt** (closest
   to UZ), save the DB password somewhere safe.
3. Wait ~2 minutes for provisioning.

## 2. Apply schema

Open **SQL Editor** in the Supabase dashboard, paste the entire content of
`supabase/schema.sql`, click **Run**. This creates:

- `public.articles` table with all Google Scholar / Highwire fields
- Row Level Security policies (public read on published, write for logged-in admin)
- `article-pdfs` public storage bucket + policies

## 3. Create the admin user

**Authentication → Users → Add user → Create new user**:

- Email: your admin email (e.g. `admin@uzsiac.uz`)
- Password: pick a strong one
- ✅ **Auto Confirm User** (so you can sign in immediately without email verification)

This is the account you will use to sign in at `/admin.html`.

Then, to disable public signups (only you should be able to log in):
**Authentication → Providers → Email** → turn **Enable Sign-ups** OFF.

## 4. Grab keys

**Project Settings → API**:

- `Project URL` → e.g. `https://xxxxxxxx.supabase.co`
- `anon public` key (starts with `eyJ...`) — safe to expose in the browser

## 5. Wire env vars

For **local dev**, create `.env.local` in each project root:

```
# journal/.env.local  AND  madaniyat-sanat/.env.local
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Vite loads `VITE_*`-prefixed vars automatically. `.env.local` is gitignored.

For **Vercel** — add the same two vars in each project:
**Project Settings → Environment Variables** for both `Production` and `Preview`.

## 6. Deploy

Just `git push`. Vercel rebuilds.

## 7. Admin subdomain (`admin.<site>`)

The admin panel lives on a dedicated subdomain:

- Journal: `https://admin.uzsiac-bulletin.uz`
- Madaniyat: `https://admin.juca.uz`

Setup per project (one-time):

1. **Vercel → Project Settings → Domains → Add**:
   - Enter `admin.uzsiac-bulletin.uz` (or `admin.juca.uz`)
2. Vercel shows DNS instructions. In your DNS provider add a CNAME record:
   - `Name`: `admin`
   - `Value`: `cname.vercel-dns.com`
3. Wait for DNS to propagate (usually <5 min) and Vercel to issue the SSL cert.
4. That's it. `vercel.json` already rewrites `/` on the admin subdomain to
   `/admin.html`, and redirects `/admin.html` on the main domain to the
   subdomain — so bookmarks keep working.

## 8. URLs after deploy

- Public site: `https://<site>/` (main content)
- Public article list: `https://<site>/#maqolalar` — client-side fetch, filters by year / language / free-text
- Article detail: `https://<site>/maqola/<slug>` — server-rendered via Vercel
  serverless function (`api/article/[slug].js`) with full Google Scholar
  (`citation_*`) meta tags so Scholar can crawl and index each article.
- Admin panel: `https://admin.<site>/` (login required, `noindex` for bots)

## 9. Adding an article

1. Open `https://admin.<site>/`, sign in
2. Click **+ Yangi**, fill in fields (title, authors, abstract, year/issue, keywords, PDF)
3. **Saqlash** — instantly appears on `/#maqolalar`
4. Detail page at `/maqola/<slug>` is served fresh via the serverless function
   (cached at Vercel edge for 5 min, stale-while-revalidate 1 h)

Uncheck **Nashr etilgan** to save a draft (hidden from public).

## Local dev

```bash
npm install
npm run dev
```

Then open http://localhost:5173 (public) or http://localhost:5173/admin.html.

Note: Vercel serverless functions (`/maqola/*`) don't run under `vite dev`. Test
them via `vercel dev` (`npm i -g vercel`) or after deploy.

