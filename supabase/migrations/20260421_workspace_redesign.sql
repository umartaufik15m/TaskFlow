create table if not exists public.companies (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_name_unique unique (user_id, name)
);

create table if not exists public.categories (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  domain text not null check (domain in ('work', 'personal')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_unique unique (user_id, domain, name)
);

insert into public.companies (id, user_id, name)
values ('company-personal', null, 'Pribadi')
on conflict (id) do update set name = excluded.name;

insert into public.categories (id, user_id, name, domain)
values
  ('category-work-task', null, 'Task', 'work'),
  ('category-work-project', null, 'Project', 'work'),
  ('category-work-event', null, 'Event', 'work'),
  ('category-personal-task', null, 'Tugas', 'personal'),
  ('category-personal-hobby', null, 'Hobi', 'personal'),
  ('category-personal-event', null, 'Event', 'personal')
on conflict (id) do update set
  name = excluded.name,
  domain = excluded.domain;

alter table public.tasks
  add column if not exists scope text not null default 'personal' check (scope in ('work', 'personal')),
  add column if not exists company_id text,
  add column if not exists category_id text,
  add column if not exists scheduled_for text,
  add column if not exists has_deadline boolean not null default false,
  add column if not exists deadline_at text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_company_id_fkey'
  ) then
    alter table public.tasks
      add constraint tasks_company_id_fkey
      foreign key (company_id) references public.companies(id) on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_category_id_fkey'
  ) then
    alter table public.tasks
      add constraint tasks_category_id_fkey
      foreign key (category_id) references public.categories(id) on delete set null;
  end if;
end $$;

update public.tasks
set
  scheduled_for = coalesce(scheduled_for, due_date),
  has_deadline = coalesce(has_deadline, false) or due_date is not null,
  deadline_at = coalesce(deadline_at, due_date),
  category_id = coalesce(
    category_id,
    case
      when task_type = 'event' then 'category-personal-event'
      else 'category-personal-task'
    end
  ),
  company_id = coalesce(company_id, 'company-personal')
where true;
