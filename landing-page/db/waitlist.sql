create table if not exists waitlist_entries (
  id bigserial primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);
