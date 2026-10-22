-- Prio 19: secure public checkout. Run this file in Supabase SQL Editor.
-- It validates product prices/stock on the server and saves the order + items.
create or replace function public.create_store_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_payment_method text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_total numeric(12,2) := 0;
  v_item record;
  v_product public.products%rowtype;
begin
  if nullif(trim(p_customer_name), '') is null
     or nullif(trim(p_phone), '') is null
     or nullif(trim(p_address), '') is null then
    raise exception 'নাম, ফোন ও ঠিকানা দিতে হবে';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'কার্টে কোনো পণ্য নেই';
  end if;

  -- Validate every item and calculate prices from database, never from browser.
  for v_item in
    select (x->>'id')::uuid as product_id, (x->>'qty')::integer as qty
    from jsonb_array_elements(p_items) x
  loop
    if v_item.qty is null or v_item.qty < 1 then
      raise exception 'পণ্যের পরিমাণ সঠিক নয়';
    end if;
    select * into v_product from public.products
      where id = v_item.product_id and active = true
      for update;
    if not found then raise exception 'একটি পণ্য পাওয়া যায়নি বা সক্রিয় নয়'; end if;
    if v_product.stock < v_item.qty then
      raise exception 'পর্যাপ্ত স্টক নেই: %', v_product.name;
    end if;
    v_total := v_total + v_product.price * v_item.qty;
  end loop;

  insert into public.orders(customer_name, phone, address, payment_method, total, status)
  values (trim(p_customer_name), trim(p_phone), trim(p_address),
          coalesce(nullif(trim(p_payment_method), ''), 'Cash on Delivery'),
          v_total, 'নতুন')
  returning id into v_order_id;

  for v_item in
    select (x->>'id')::uuid as product_id, (x->>'qty')::integer as qty
    from jsonb_array_elements(p_items) x
  loop
    select * into v_product from public.products where id = v_item.product_id for update;
    if v_product.stock < v_item.qty then
      raise exception 'পর্যাপ্ত স্টক নেই: %', v_product.name;
    end if;
    insert into public.order_items(order_id, product_id, product_name, quantity, unit_price, line_total)
    values (v_order_id, v_product.id, v_product.name, v_item.qty, v_product.price, v_product.price * v_item.qty);
    update public.products set stock = stock - v_item.qty, updated_at = now()
    where id = v_product.id;
  end loop;
  return v_order_id;
end;
$$;

revoke all on function public.create_store_order(text,text,text,text,jsonb) from public;
grant execute on function public.create_store_order(text,text,text,text,jsonb) to anon, authenticated;
