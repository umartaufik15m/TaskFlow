create extension if not exists pgcrypto;

create table if not exists public.personal_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text,
  area text not null default 'personal' check (area in ('personal', 'work', 'health', 'learning')),
  progress smallint not null default 0 check (progress between 0 and 100),
  target_date date,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.personal_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 140),
  content text not null default '',
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_debts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  creditor text not null check (char_length(trim(creditor)) between 1 and 100),
  description text,
  total_amount_minor bigint not null check (total_amount_minor > 0),
  paid_amount_minor bigint not null default 0 check (paid_amount_minor >= 0),
  currency char(3) not null default 'IDR',
  due_date date,
  status text not null default 'active' check (status in ('active', 'paid')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (paid_amount_minor <= total_amount_minor),
  unique (id, workspace_id)
);

create table if not exists public.finance_debt_payments (
  id uuid primary key default gen_random_uuid(),
  debt_id uuid not null,
  workspace_id uuid not null,
  account_id uuid not null,
  transaction_id uuid not null references public.finance_transactions(id) on delete restrict,
  amount_minor bigint not null check (amount_minor > 0),
  payment_date date not null default current_date,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  foreign key (debt_id, workspace_id)
    references public.finance_debts(id, workspace_id) on delete restrict,
  foreign key (account_id, workspace_id)
    references public.finance_accounts(id, workspace_id) on delete restrict
);

create index if not exists personal_goals_user_target_idx
  on public.personal_goals(user_id, is_completed, target_date);
create index if not exists personal_notes_user_updated_idx
  on public.personal_notes(user_id, is_pinned desc, updated_at desc);
create index if not exists finance_debts_workspace_status_idx
  on public.finance_debts(workspace_id, status, due_date);
create index if not exists finance_debt_payments_debt_idx
  on public.finance_debt_payments(debt_id, payment_date desc);

alter table public.personal_goals enable row level security;
alter table public.personal_notes enable row level security;
alter table public.finance_debts enable row level security;
alter table public.finance_debt_payments enable row level security;

drop policy if exists personal_goals_owner_all on public.personal_goals;
create policy personal_goals_owner_all on public.personal_goals
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists personal_notes_owner_all on public.personal_notes;
create policy personal_notes_owner_all on public.personal_notes
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists finance_debts_owner_all on public.finance_debts;
create policy finance_debts_owner_all on public.finance_debts
  for all to authenticated
  using (created_by = auth.uid() and public.is_workspace_member(workspace_id))
  with check (created_by = auth.uid() and public.is_workspace_member(workspace_id));

drop policy if exists finance_debt_payments_owner_select on public.finance_debt_payments;
create policy finance_debt_payments_owner_select on public.finance_debt_payments
  for select to authenticated
  using (created_by = auth.uid() and public.is_workspace_member(workspace_id));

create or replace function public.record_debt_payment(
  target_debt_id uuid,
  target_account_id uuid,
  payment_amount_minor bigint,
  paid_on date default current_date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  viewer_id uuid := auth.uid();
  target_workspace_id uuid;
  target_creditor text;
  target_total bigint;
  target_paid bigint;
  new_transaction_id uuid;
begin
  if viewer_id is null then
    raise exception 'Authentication required';
  end if;

  if payment_amount_minor is null or payment_amount_minor <= 0 then
    raise exception 'Payment amount must be greater than zero';
  end if;

  select workspace_id, creditor, total_amount_minor, paid_amount_minor
  into target_workspace_id, target_creditor, target_total, target_paid
  from public.finance_debts
  where id = target_debt_id
    and created_by = viewer_id
    and status = 'active'
  for update;

  if target_workspace_id is null then
    raise exception 'Debt not found';
  end if;

  if payment_amount_minor > target_total - target_paid then
    raise exception 'Payment exceeds remaining debt';
  end if;

  if not exists (
    select 1 from public.finance_accounts
    where id = target_account_id
      and workspace_id = target_workspace_id
      and created_by = viewer_id
  ) then
    raise exception 'Account not found';
  end if;

  insert into public.finance_transactions (
    workspace_id,
    account_id,
    category_id,
    kind,
    amount_minor,
    currency,
    description,
    transaction_date,
    is_recurring,
    created_by
  ) values (
    target_workspace_id,
    target_account_id,
    null,
    'expense',
    payment_amount_minor,
    'IDR',
    'Bayar hutang - ' || target_creditor,
    coalesce(paid_on, current_date),
    false,
    viewer_id
  ) returning id into new_transaction_id;

  insert into public.finance_debt_payments (
    debt_id,
    workspace_id,
    account_id,
    transaction_id,
    amount_minor,
    payment_date,
    created_by
  ) values (
    target_debt_id,
    target_workspace_id,
    target_account_id,
    new_transaction_id,
    payment_amount_minor,
    coalesce(paid_on, current_date),
    viewer_id
  );

  update public.finance_debts
  set
    paid_amount_minor = paid_amount_minor + payment_amount_minor,
    status = case
      when paid_amount_minor + payment_amount_minor >= total_amount_minor then 'paid'
      else 'active'
    end,
    updated_at = now()
  where id = target_debt_id;

  return new_transaction_id;
end;
$$;

revoke all on function public.record_debt_payment(uuid, uuid, bigint, date) from public;
grant execute on function public.record_debt_payment(uuid, uuid, bigint, date) to authenticated;
