-- Migration: Create boards table
-- A board is identified by its unique URL slug (e.g., "my-project-board")

-- Function to auto-update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Boards table
create table if not exists boards (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at on row change
create trigger boards_updated_at
  before update on boards
  for each row
  execute function update_updated_at();

-- Index for fast slug lookups
create index if not exists idx_boards_slug on boards (slug);

-- Enable RLS
alter table boards enable row level security;

-- Anonymous access policies (no auth required)
create policy "boards_select" on boards for select using (true);
create policy "boards_insert" on boards for insert with check (true);
create policy "boards_update" on boards for update using (true) with check (true);
create policy "boards_delete" on boards for delete using (true);
