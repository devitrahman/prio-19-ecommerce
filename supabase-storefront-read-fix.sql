-- Allow the public storefront to read active products only.
grant select on table public.products to anon, authenticated;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select
to anon, authenticated
using (active = true or public.is_admin());

alter table public.products enable row level security;
