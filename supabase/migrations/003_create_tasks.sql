-- Migration: Create tasks table
-- Tasks belong to a column and are ordered by position

create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  column_id   uuid not null references columns(id) on delete cascade,
  title       text not null,
  description text,
  priority    text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'urgent')),
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at on row change
create trigger tasks_updated_at
  before update on tasks
  for each row
  execute function update_updated_at();

-- Index for fetching tasks by column
create index if not exists idx_tasks_column_id on tasks (column_id);

-- Composite index for ordered task listing
create index if not exists idx_tasks_column_position on tasks (column_id, position);

-- Enable RLS
alter table tasks enable row level security;

-- Anonymous access policies
create policy "tasks_select" on tasks for select using (true);
create policy "tasks_insert" on tasks for insert with check (true);
create policy "tasks_update" on tasks for update using (true) with check (true);
create policy "tasks_delete" on tasks for delete using (true);
