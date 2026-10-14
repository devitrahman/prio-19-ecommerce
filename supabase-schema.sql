-- Prio 19 database setup. Run in Supabase SQL Editor.
-- Never put service_role/secret key in website files.
create extension if not exists pgcrypto;
create table if not exists public.profiles(user_id uuid primary key references auth.users(id) on delete cascade,role text not null default 'customer' check(role in ('customer','admin')),created_at timestamptz not null default now());
create table if not exists public.products(id uuid primary key default gen_random_uuid(),name text not null check(char_length(name) between 1 and 160),category text not null check(char_length(category) between 1 and 80),description text not null default '',price numeric(12,2) not null check(price>=0),stock integer not null default 0 check(stock>=0),image_url text,active boolean not null default true,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.orders(id uuid primary key default gen_random_uuid(),customer_id uuid references auth.users(id) on delete set null,customer_name text not null,phone text not null,address text not null,payment_method text not null default 'Cash on Delivery',total numeric(12,2) not null check(total>=0),status text not null default 'নতুন' check(status in ('নতুন','গৃহীত','প্রস্তুত হচ্ছে','পাঠানো হয়েছে','ডেলিভারি সম্পন্ন','বাতিল')),created_at timestamptz not null default now());
create table if not exists public.order_items(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,product_id uuid references public.products(id) on delete set null,product_name text not null,quantity integer not null check(quantity>0),unit_price numeric(12,2) not null check(unit_price>=0),line_total numeric(12,2) not null check(line_total>=0));
create index if not exists products_active_idx on public.products(active);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where user_id=auth.uid() and role='admin'); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon,authenticated;
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select to authenticated using(user_id=auth.uid() or public.is_admin());
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products" on public.products for select to anon,authenticated using(active=true or public.is_admin());
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products for all to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists "Admins read orders" on public.orders;
create policy "Admins read orders" on public.orders for select to authenticated using(public.is_admin());
drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders" on public.orders for update to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists "Admins read order items" on public.order_items;
create policy "Admins read order items" on public.order_items for select to authenticated using(public.is_admin());
-- Public checkout policies intentionally omitted until a server-side checkout function validates prices and stock.
-- Do not enable online payments until server-side validation and a payment provider are configured.