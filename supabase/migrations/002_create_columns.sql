-- Migration: Create columns table
-- Columns belong to a board and are ordered by position

create table if not exists columns (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid not null references boards(id) on delete cascade,
  title      text not null default 'Untitled',
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

-- Index for fetching columns by board
create index if not exists idx_columns_board_id on columns (board_id);

-- Composite index for ordered column listing
create index if not exists idx_columns_board_position on columns (board_id, position);

-- Enable RLS
alter table columns enable row level security;

-- Anonymous access policies
create policy "columns_select" on columns for select using (true);
create policy "columns_insert" on columns for insert with check (true);
create policy "columns_update" on columns for update using (true) with check (true);
create policy "columns_delete" on columns for delete using (true);
