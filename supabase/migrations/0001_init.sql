-- Repertorio vocal: piezas por usuario + registro de ensayos
create type public.piece_status as enum ('por_aprender', 'en_estudio', 'listo');

create table public.pieces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  composer text not null check (char_length(composer) between 1 and 120),
  work text check (char_length(work) <= 160),
  role text check (char_length(role) <= 80),
  language text check (char_length(language) <= 40),
  key text check (char_length(key) <= 20),
  range_low text check (range_low ~ '^[A-G](#|b)?[0-7]$'),
  range_high text check (range_high ~ '^[A-G](#|b)?[0-7]$'),
  status public.piece_status not null default 'por_aprender',
  difficulty smallint not null default 3 check (difficulty between 1 and 5),
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rehearsals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  piece_id uuid not null references public.pieces(id) on delete cascade,
  practiced_on date not null default current_date,
  minutes smallint not null check (minutes between 1 and 600),
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now()
);

create index pieces_user_idx on public.pieces(user_id);
create index rehearsals_user_idx on public.rehearsals(user_id);
create index rehearsals_piece_idx on public.rehearsals(piece_id, practiced_on desc);

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger pieces_updated_at before update on public.pieces
for each row execute function public.set_updated_at();

alter table public.pieces enable row level security;
alter table public.rehearsals enable row level security;

create policy "pieces_select_own" on public.pieces for select to authenticated using ((select auth.uid()) = user_id);
create policy "pieces_insert_own" on public.pieces for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "pieces_update_own" on public.pieces for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "pieces_delete_own" on public.pieces for delete to authenticated using ((select auth.uid()) = user_id);

create policy "rehearsals_select_own" on public.rehearsals for select to authenticated using ((select auth.uid()) = user_id);
create policy "rehearsals_insert_own" on public.rehearsals for insert to authenticated
  with check ((select auth.uid()) = user_id and exists (select 1 from public.pieces p where p.id = piece_id and p.user_id = (select auth.uid())));
create policy "rehearsals_delete_own" on public.rehearsals for delete to authenticated using ((select auth.uid()) = user_id);
