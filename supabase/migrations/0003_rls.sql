-- ============================================================================
-- 0003_rls.sql
-- Row Level Security policies. Authorization is enforced here at the
-- database layer (not just hidden in the UI) and mirrored by server-side
-- checks in the Next.js app. Depends on is_admin() from 0002_functions.sql.
-- ============================================================================

alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table inventory_transactions enable row level security;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------

create policy "profiles_select_own_or_admin" on profiles
  for select using (id = auth.uid() or is_admin());

create policy "profiles_update_own_or_admin" on profiles
  for update using (id = auth.uid() or is_admin());

-- No insert/delete policy for regular clients: rows are created by the
-- handle_new_user trigger (security definer) on signup. Role changes are
-- blocked for non-admins by the prevent_role_self_escalation trigger
-- (created in 0002_functions.sql, alongside guard_profile_role_change()).

-- ----------------------------------------------------------------------------
-- categories: publicly readable when active, admin-managed
-- ----------------------------------------------------------------------------

create policy "categories_select_active_or_admin" on categories
  for select using (is_active or is_admin());

create policy "categories_admin_insert" on categories
  for insert with check (is_admin());

create policy "categories_admin_update" on categories
  for update using (is_admin());

create policy "categories_admin_delete" on categories
  for delete using (is_admin());

-- ----------------------------------------------------------------------------
-- products: publicly readable when available, admin-managed
-- ----------------------------------------------------------------------------

create policy "products_select_available_or_admin" on products
  for select using (is_available or is_admin());

create policy "products_admin_insert" on products
  for insert with check (is_admin());

create policy "products_admin_update" on products
  for update using (is_admin());

create policy "products_admin_delete" on products
  for delete using (is_admin());

-- ----------------------------------------------------------------------------
-- carts / cart_items: owner only
-- ----------------------------------------------------------------------------

create policy "carts_owner_all" on carts
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "cart_items_owner_all" on cart_items
  for all using (
    exists (select 1 from carts where carts.id = cart_id and carts.profile_id = auth.uid())
  )
  with check (
    exists (select 1 from carts where carts.id = cart_id and carts.profile_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- orders / order_items
--
-- Customers can read their own orders but never insert/update them directly:
-- every order is created atomically by the create_order() SECURITY DEFINER
-- function (which validates stock, snapshots line items, and decrements
-- inventory in one transaction), and status/payment fields only change
-- through admin action. This rules out a customer inserting an order that
-- skips stock checks.
-- ----------------------------------------------------------------------------

create policy "orders_select_own_or_admin" on orders
  for select using (profile_id = auth.uid() or is_admin());

create policy "orders_admin_update" on orders
  for update using (is_admin());

create policy "order_items_select_own_or_admin" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_id and (orders.profile_id = auth.uid() or is_admin())
    )
  );

-- ----------------------------------------------------------------------------
-- inventory_transactions: admin only
-- ----------------------------------------------------------------------------

create policy "inventory_transactions_admin_select" on inventory_transactions
  for select using (is_admin());

create policy "inventory_transactions_admin_insert" on inventory_transactions
  for insert with check (is_admin());
