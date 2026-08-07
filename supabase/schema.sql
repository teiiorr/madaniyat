-- Articles schema for uzsiac-news.uz (journal) and uzsiac-journal.uz (madaniyat)
-- Run once in Supabase → SQL Editor. Safe to re-run: uses IF NOT EXISTS / OR REPLACE.

-- 1. Table --------------------------------------------------------------------
create table if not exists public.articles (
    id            uuid primary key default gen_random_uuid(),
    site          text not null check (site in ('journal', 'madaniyat')),
    slug          text not null,
    title         text not null,
    authors       jsonb not null default '[]'::jsonb,
    -- authors is [{name, affiliation, orcid, email}]
    abstract      text,
    keywords      text[] default '{}',
    language      text default 'uz' check (language in ('uz', 'ru', 'en', 'kaa')),
    rubric        text,
    journal_year  int,
    journal_issue int,
    first_page    int,
    last_page     int,
    doi           text,
    udk           text,
    pdf_url       text,
    pdf_path      text,
    references_list text,
    is_published  boolean not null default true,
    published_at  timestamptz default now(),
    created_at    timestamptz default now(),
    updated_at    timestamptz default now(),
    unique (site, slug)
);

create index if not exists articles_site_published_idx
    on public.articles (site, is_published, published_at desc);

create index if not exists articles_site_year_issue_idx
    on public.articles (site, journal_year desc, journal_issue desc);

-- Auto-update updated_at ------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at := now();
    return new;
end $$;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
    before update on public.articles
    for each row execute function public.set_updated_at();

-- 2. Row Level Security -------------------------------------------------------
alter table public.articles enable row level security;

drop policy if exists "public read published" on public.articles;
create policy "public read published"
    on public.articles for select
    using (is_published = true);

drop policy if exists "authenticated read all" on public.articles;
create policy "authenticated read all"
    on public.articles for select
    to authenticated
    using (true);

drop policy if exists "authenticated write" on public.articles;
create policy "authenticated write"
    on public.articles for all
    to authenticated
    using (true)
    with check (true);

-- 3. Storage ------------------------------------------------------------------
-- Create a public storage bucket for article PDFs.
insert into storage.buckets (id, name, public)
values ('article-pdfs', 'article-pdfs', true)
on conflict (id) do update set public = true;

drop policy if exists "public read pdfs" on storage.objects;
create policy "public read pdfs"
    on storage.objects for select
    using (bucket_id = 'article-pdfs');

drop policy if exists "authenticated upload pdfs" on storage.objects;
create policy "authenticated upload pdfs"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'article-pdfs');

drop policy if exists "authenticated update pdfs" on storage.objects;
create policy "authenticated update pdfs"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'article-pdfs');

drop policy if exists "authenticated delete pdfs" on storage.objects;
create policy "authenticated delete pdfs"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'article-pdfs');
