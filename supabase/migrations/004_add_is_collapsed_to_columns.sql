-- Migration: Add is_collapsed to columns table

alter table columns add column if not exists is_collapsed boolean not null default false;
