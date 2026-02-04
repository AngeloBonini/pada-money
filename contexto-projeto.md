# CONTEXTO_PROJETO.md

## 1. Visão Geral do Produto
**Nome:** Zero-Input Finance (MVP)
**Tipo:** SaaS B2C
**Objetivo:** Plataforma de gestão financeira pessoal onde o usuário NÃO digita gastos manualmente. O foco é ingestão automática (PDF/Extratos) via IA, categorização inteligente e insights em linguagem natural.
**Diferencial:** Zero input manual, UI minimalista ("Calm Design"), Insights acionáveis.

---

## 2. Tech Stack & Ferramentas
* **Framework:** Next.js 14+ (App Router)
* **Linguagem:** TypeScript
* **Estilização:** Tailwind CSS + Shadcn/ui (Radix primitives)
* **Banco de Dados & Auth:** Supabase (PostgreSQL + Auth Helpers)
* **AI/LLM:** OpenAI API (`gpt-4o-mini`) para parsing e insights.
* **Pagamentos:** AbacatePay (SDK Node.js) - Foco em PIX.
* **Bibliotecas Chave:** * `pdf-parse` (Extração de texto de PDF no backend)
    * `recharts` (Gráficos simples)
    * `lucide-react` (Ícones)
    * `zod` (Validação)

---

## 3. Estrutura do Banco de Dados (Supabase)

O Agente deve utilizar este schema SQL como base.

```sql
-- Habilita extensão para UUIDs
create extension if not exists "uuid-ossp";

-- 1. Tabela de Perfis (Vinculada ao Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  abacate_customer_id text, -- ID do cliente no AbacatePay
  subscription_status text default 'free', -- 'active', 'free', 'past_due'
  last_payment_date date,
  created_at timestamp with time zone default now()
);

-- 2. Tabela de Transações (Dados Financeiros)
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
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

-- 3. Tabela de Insights (Gerados pela IA)
create table public.insights (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  content text not null,
  sentiment text check (sentiment in ('positive', 'neutral', 'warning')),
  created_at timestamp with time zone default now()
);

-- RLS (Segurança)
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.insights enable row level security;

create policy "Users can view own data" on profiles for select using (auth.uid() = id);
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on transactions for update using (auth.uid() = user_id);