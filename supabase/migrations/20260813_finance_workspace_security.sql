create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.finance_accounts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  account_type text not null check (account_type in ('cash', 'bank', 'ewallet', 'investment')),
  opening_balance_minor bigint not null default 0,
  currency char(3) not null default 'IDR',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, workspace_id)
);

create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  kind text not null check (kind in ('income', 'expense')),
  color text not null default '#8b5cf6',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (workspace_id, kind, name),
  unique (id, workspace_id)
);

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  account_id uuid not null,
  category_id uuid,
  kind text not null check (kind in ('income', 'expense')),
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null default 'IDR',
  description text not null check (char_length(trim(description)) between 1 and 160),
  transaction_date date not null default current_date,
  is_recurring boolean not null default false,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (account_id, workspace_id)
    references public.finance_accounts(id, workspace_id) on delete restrict,
  foreign key (category_id, workspace_id)
    references public.finance_categories(id, workspace_id) on delete restrict
);

create table if not exists public.finance_budgets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  category_id uuid not null,
  month_key text not null check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null default 'IDR',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, category_id, month_key),
  foreign key (category_id, workspace_id)
    references public.finance_categories(id, workspace_id) on delete cascade
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 100),
  target_amount_minor bigint not null check (target_amount_minor > 0),
  current_amount_minor bigint not null default 0 check (current_amount_minor >= 0),
  currency char(3) not null default 'IDR',
  target_date date,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspace_members_user_idx
  on public.workspace_members(user_id, workspace_id);
create index if not exists finance_accounts_workspace_idx
  on public.finance_accounts(workspace_id);
create index if not exists finance_transactions_workspace_date_idx
  on public.finance_transactions(workspace_id, transaction_date desc);
create index if not exists finance_budgets_workspace_month_idx
  on public.finance_budgets(workspace_id, month_key);
create index if not exists savings_goals_workspace_idx
  on public.savings_goals(workspace_id);

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspaces
    where id = target_workspace_id
      and owner_id = auth.uid()
  );
$$;

create or replace function public.ensure_personal_workspace()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  viewer_id uuid := auth.uid();
  target_workspace_id uuid;
begin
  if viewer_id is null then
    raise exception 'Authentication required';
  end if;

  select workspace_id into target_workspace_id
  from public.workspace_members
  where user_id = viewer_id
  order by (role = 'owner') desc, created_at asc
  limit 1;

  if target_workspace_id is null then
    insert into public.workspaces (name, owner_id)
    values ('Workspace Pribadi', viewer_id)
    returning id into target_workspace_id;

    insert into public.workspace_members (workspace_id, user_id, role)
    values (target_workspace_id, viewer_id, 'owner');
  end if;

  insert into public.finance_categories (workspace_id, name, kind, color, created_by)
  values
    (target_workspace_id, 'Gaji', 'income', '#34d399', viewer_id),
    (target_workspace_id, 'Pendapatan lain', 'income', '#60a5fa', viewer_id),
    (target_workspace_id, 'Makanan', 'expense', '#fb7185', viewer_id),
    (target_workspace_id, 'Transportasi', 'expense', '#f59e0b', viewer_id),
    (target_workspace_id, 'Tagihan', 'expense', '#a78bfa', viewer_id),
    (target_workspace_id, 'Hiburan', 'expense', '#ec4899', viewer_id)
  on conflict (workspace_id, kind, name) do nothing;

  return target_workspace_id;
end;
$$;

revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.is_workspace_owner(uuid) from public;
revoke all on function public.ensure_personal_workspace() from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.is_workspace_owner(uuid) to authenticated;
grant execute on function public.ensure_personal_workspace() to authenticated;

alter table public.tasks enable row level security;
alter table public.companies enable row level security;
alter table public.categories enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.finance_accounts enable row level security;
alter table public.finance_categories enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.finance_budgets enable row level security;
alter table public.savings_goals enable row level security;

drop policy if exists tasks_owner_all on public.tasks;
create policy tasks_owner_all on public.tasks
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists companies_visible on public.companies;
create policy companies_visible on public.companies
  for select to authenticated
  using (user_id is null or user_id = auth.uid());
drop policy if exists companies_owner_insert on public.companies;
create policy companies_owner_insert on public.companies
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists companies_owner_update on public.companies;
create policy companies_owner_update on public.companies
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists companies_owner_delete on public.companies;
create policy companies_owner_delete on public.companies
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists categories_visible on public.categories;
create policy categories_visible on public.categories
  for select to authenticated
  using (user_id is null or user_id = auth.uid());
drop policy if exists categories_owner_insert on public.categories;
create policy categories_owner_insert on public.categories
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists categories_owner_update on public.categories;
create policy categories_owner_update on public.categories
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists categories_owner_delete on public.categories;
create policy categories_owner_delete on public.categories
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists workspaces_member_select on public.workspaces;
create policy workspaces_member_select on public.workspaces
  for select to authenticated using (public.is_workspace_member(id));
drop policy if exists workspaces_owner_update on public.workspaces;
create policy workspaces_owner_update on public.workspaces
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists workspaces_owner_delete on public.workspaces;
create policy workspaces_owner_delete on public.workspaces
  for delete to authenticated using (owner_id = auth.uid());

drop policy if exists workspace_members_member_select on public.workspace_members;
create policy workspace_members_member_select on public.workspace_members
  for select to authenticated using (public.is_workspace_member(workspace_id));
drop policy if exists workspace_members_owner_manage on public.workspace_members;
create policy workspace_members_owner_manage on public.workspace_members
  for all to authenticated
  using (public.is_workspace_owner(workspace_id))
  with check (public.is_workspace_owner(workspace_id));

drop policy if exists finance_accounts_member_all on public.finance_accounts;
create policy finance_accounts_member_all on public.finance_accounts
  for all to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());

drop policy if exists finance_categories_member_all on public.finance_categories;
create policy finance_categories_member_all on public.finance_categories
  for all to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());

drop policy if exists finance_transactions_member_all on public.finance_transactions;
create policy finance_transactions_member_all on public.finance_transactions
  for all to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());

drop policy if exists finance_budgets_member_all on public.finance_budgets;
create policy finance_budgets_member_all on public.finance_budgets
  for all to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());

drop policy if exists savings_goals_member_all on public.savings_goals;
create policy savings_goals_member_all on public.savings_goals
  for all to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());
