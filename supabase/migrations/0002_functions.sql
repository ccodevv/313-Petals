-- ============================================================================
-- 0002_functions.sql
-- Security-definer functions: the admin-check helper (used by RLS policies
-- in 0003_rls.sql), profile bootstrap, role-change guard, atomic order
-- placement (prevents overselling under concurrent checkouts), and admin
-- stock adjustments.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- is_admin: is the current JWT's user an admin? SECURITY DEFINER + a fixed
-- search_path avoids recursive RLS lookups on profiles and search_path
-- hijacking. Used throughout the RLS policies in 0003_rls.sql.
-- ----------------------------------------------------------------------------

create function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable set search_path = public;

-- ----------------------------------------------------------------------------
-- handle_new_user: create a profile row the moment a user signs up.
-- Role always starts as 'customer' - admins are promoted manually in the
-- database, never through user-controlled signup data.
-- ----------------------------------------------------------------------------

create function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- guard_profile_role_change: a signed-in customer can never change anyone's
-- role, including their own. auth.uid() is null outside of a PostgREST
-- request (the Supabase SQL editor, the dashboard, a service-role script),
-- so that path is left open - it's how the first admin gets promoted (see
-- README) and is not something a customer can reach through the app.
-- ----------------------------------------------------------------------------

create function guard_profile_role_change() returns trigger as $$
begin
  if new.role <> old.role and auth.uid() is not null and not is_admin() then
    raise exception 'Only admins can change a profile role';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger prevent_role_self_escalation
  before update on profiles
  for each row execute function guard_profile_role_change();

-- ----------------------------------------------------------------------------
-- create_order: atomically validates stock, snapshots line items, creates
-- the order + order_items, decrements product stock, and records inventory
-- transactions - all inside one function so concurrent checkouts on the
-- same product cannot oversell it.
--
-- p_items shape: [{ "product_id": "...", "quantity": 2 }, ...]
-- ----------------------------------------------------------------------------

create function create_order(
  p_contact_name text,
  p_contact_phone text,
  p_contact_email text,
  p_fulfillment_type fulfillment_type,
  p_delivery_address text,
  p_preferred_datetime timestamptz,
  p_payment_method payment_method,
  p_notes text,
  p_items jsonb
) returns uuid as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(10, 2) := 0;
  v_item jsonb;
  v_product products%rowtype;
  v_quantity integer;
  v_line_total numeric(10, 2);
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'An order must contain at least one item';
  end if;

  v_order_number := to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into orders (
    order_number, profile_id, status, payment_status, payment_method,
    fulfillment_type, delivery_address, preferred_datetime,
    contact_name, contact_phone, contact_email, notes, subtotal, total
  ) values (
    v_order_number, auth.uid(), 'pending', 'unpaid', p_payment_method,
    p_fulfillment_type, p_delivery_address, p_preferred_datetime,
    p_contact_name, p_contact_phone, p_contact_email, p_notes, 0, 0
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid quantity for product %', v_item ->> 'product_id';
    end if;

    -- Row lock prevents two concurrent checkouts from both reading stale
    -- stock and both succeeding.
    select * into v_product from products
      where id = (v_item ->> 'product_id')::uuid
      for update;

    if not found or not v_product.is_available then
      raise exception 'Product % is not available', v_item ->> 'product_id';
    end if;

    if v_product.stock < v_quantity then
      raise exception 'Insufficient stock for %: requested %, available %',
        v_product.name, v_quantity, v_product.stock;
    end if;

    v_line_total := v_product.price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;

    insert into order_items (order_id, product_id, product_name, product_price, quantity, line_total)
    values (v_order_id, v_product.id, v_product.name, v_product.price, v_quantity, v_line_total);

    update products set stock = stock - v_quantity where id = v_product.id;

    insert into inventory_transactions (product_id, change_quantity, reason, reference_order_id, created_by)
    values (v_product.id, -v_quantity, 'order', v_order_id, auth.uid());
  end loop;

  update orders set subtotal = v_subtotal, total = v_subtotal where id = v_order_id;

  delete from cart_items where cart_id in (select id from carts where profile_id = auth.uid());

  return v_order_id;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function create_order to authenticated;

-- ----------------------------------------------------------------------------
-- adjust_stock: admin-only helper for restocks/manual adjustments. Keeps
-- products.stock and the inventory_transactions ledger in sync in one call.
-- ----------------------------------------------------------------------------

create function adjust_stock(
  p_product_id uuid,
  p_change_quantity integer,
  p_reason inventory_reason,
  p_note text
) returns void as $$
declare
  v_new_stock integer;
begin
  if not is_admin() then
    raise exception 'Only admins can adjust stock';
  end if;

  update products
    set stock = stock + p_change_quantity
    where id = p_product_id
    returning stock into v_new_stock;

  if not found then
    raise exception 'Product % not found', p_product_id;
  end if;

  if v_new_stock < 0 then
    raise exception 'Stock adjustment would result in negative stock';
  end if;

  insert into inventory_transactions (product_id, change_quantity, reason, note, created_by)
  values (p_product_id, p_change_quantity, p_reason, p_note, auth.uid());
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function adjust_stock to authenticated;
