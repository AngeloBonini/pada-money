-- ==================================================
-- Zero-Input Finance - Schema do Banco de Dados
-- Execute este SQL no Supabase SQL Editor
-- ==================================================

-- Habilita extensão para UUIDs
create extension if not exists "uuid-ossp";

-- ==================================================
-- 1. Tabela de Perfis (Vinculada ao Supabase Auth)
-- ==================================================
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  abacate_customer_id text, -- ID do cliente no AbacatePay
  subscription_status text default 'free', -- 'active', 'free', 'past_due'
  last_payment_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==================================================
-- 2. Tabela de Transações (Dados Financeiros)
-- ==================================================
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric(10, 2) not null, -- Negativo = Gasto, Positivo = Renda
  description text not null, -- Texto original da fatura
  clean_description text, -- Texto limpo (ex: "Uber")
  category text, -- Sugerido pela IA (Alimentação, Transporte, etc)
  date date not null,
  type text check (type in ('income', 'expense')),
  source_file text, -- Nome do arquivo de origem (rastreabilidade)
  is_verified boolean default false, -- Se o usuário validou a classificação
  created_at timestamp with time zone default now()
);

-- ==================================================
-- 3. Tabela de Insights (Gerados pela IA)
-- ==================================================
create table public.insights (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  sentiment text check (sentiment in ('positive', 'neutral', 'warning')),
  is_read boolean default false,
  created_at timestamp with time zone default now()
);

-- ==================================================
-- 4. Row Level Security (RLS)
-- ==================================================
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.insights enable row level security;

-- Profiles: usuário pode ver e atualizar apenas seu próprio perfil
create policy "Users can view own profile" 
  on profiles for select 
  using (auth.uid() = id);

create policy "Users can update own profile" 
  on profiles for update 
  using (auth.uid() = id);

-- Transactions: usuário pode gerenciar apenas suas próprias transações
create policy "Users can view own transactions" 
  on transactions for select 
  using (auth.uid() = user_id);

create policy "Users can insert own transactions" 
  on transactions for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own transactions" 
  on transactions for update 
  using (auth.uid() = user_id);

create policy "Users can delete own transactions" 
  on transactions for delete 
  using (auth.uid() = user_id);

-- Insights: usuário pode ver e atualizar apenas seus próprios insights
create policy "Users can view own insights" 
  on insights for select 
  using (auth.uid() = user_id);

create policy "Users can update own insights" 
  on insights for update 
  using (auth.uid() = user_id);

-- ==================================================
-- 5. Trigger: Criar perfil automaticamente no signup
-- ==================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==================================================
-- 6. Índices para Performance
-- ==================================================
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_date on public.transactions(date);
create index idx_transactions_category on public.transactions(category);
create index idx_insights_user_id on public.insights(user_id);

-- ==================================================
-- 7. Tabela de Despesas Recorrentes (Onboarding)
-- ==================================================
create table if not exists public.recurring_expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  amount numeric(10, 2) not null,
  category text default 'fixed',
  created_at timestamp with time zone default now()
);

alter table public.recurring_expenses enable row level security;

create policy "Users can view own recurring expenses" 
  on recurring_expenses for select 
  using (auth.uid() = user_id);

create policy "Users can insert own recurring expenses" 
  on recurring_expenses for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own recurring expenses" 
  on recurring_expenses for update 
  using (auth.uid() = user_id);

create policy "Users can delete own recurring expenses" 
  on recurring_expenses for delete 
  using (auth.uid() = user_id);
