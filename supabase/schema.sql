-- ATLAS — schema Supabase
-- Esegui questo SQL nel tuo progetto Supabase: SQL Editor → New query → incolla → Run.

-- Tabella: una riga per utente, contiene tutte le sue schede in JSON.
create table if not exists public.user_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  schede     jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security: ogni utente vede e modifica SOLO i propri dati.
alter table public.user_data enable row level security;

drop policy if exists "leggi i propri dati" on public.user_data;
create policy "leggi i propri dati"
  on public.user_data for select
  using (auth.uid() = user_id);

drop policy if exists "inserisci i propri dati" on public.user_data;
create policy "inserisci i propri dati"
  on public.user_data for insert
  with check (auth.uid() = user_id);

drop policy if exists "aggiorna i propri dati" on public.user_data;
create policy "aggiorna i propri dati"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
