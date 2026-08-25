-- ============================================================================
-- 0001_init.sql
-- Core schema for the flower shop: profiles, categories, products, cart,
-- orders, and inventory transactions.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------

create type user_role as enum ('customer', 'admin');

create type order_status as enum (
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'completed',
  'cancelled'
);

create type payment_status as enum ('unpaid', 'paid', 'refunded');

create type payment_method as enum ('cash', 'gcash', 'bank_transfer', 'card');

create type fulfillment_type as enum ('delivery', 'pickup');

create type inventory_reason as enum ('order', 'restock', 'adjustment', 'return');

-- ----------------------------------------------------------------------------
-- profiles
--
-- One row per authenticated user (both customers and admins). This doubles
-- as the "customer" record described in the spec: a customer is simply a
-- user whose role is 'customer', so we avoid a duplicate customers table
-- and the data-sync problems that would come with it. Created automatically
-- by a trigger on auth.users (see 0003_functions.sql).
-- ----------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null,
  phone text,
  delivery_address text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on profiles (role);

-- ----------------------------------------------------------------------------
-- categories
-- ----------------------------------------------------------------------------

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_unique unique (name)
);

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on products (category_id);
create index products_is_available_idx on products (is_available);
create index products_name_idx on products using gin (to_tsvector('english', name));

-- ----------------------------------------------------------------------------
-- carts / cart_items
--
-- One cart per profile. Cart items reference a product; quantity is
-- validated against live stock at read/checkout time rather than trusting
-- what was stored when the item was added.
-- ----------------------------------------------------------------------------

create table carts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts (id) on delete cascade,
  product_id uuid not null references products (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_cart_product_unique unique (cart_id, product_id)
);

create index cart_items_cart_id_idx on cart_items (cart_id);

-- ----------------------------------------------------------------------------
-- orders / order_items
--
-- order_items snapshots product name/price at time of purchase so historical
-- orders stay accurate even if a product is later renamed, repriced, or
-- deleted. product_id is kept for reporting but set null on product deletion.
-- ----------------------------------------------------------------------------

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  profile_id uuid not null references profiles (id) on delete restrict,
  status order_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',
  payment_method payment_method not null default 'cash',
  fulfillment_type fulfillment_type not null default 'pickup',
  delivery_address text,
  preferred_datetime timestamptz,
  contact_name text not null,
  contact_phone text not null,
  contact_email text not null,
  notes text,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  total numeric(10, 2) not null check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_delivery_address_required check (
    fulfillment_type = 'pickup' or delivery_address is not null
  )
);

create index orders_profile_id_idx on orders (profile_id);
create index orders_status_idx on orders (status);
create index orders_created_at_idx on orders (created_at desc);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  product_name text not null,
  product_price numeric(10, 2) not null check (product_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on order_items (order_id);
create index order_items_product_id_idx on order_items (product_id);

-- ----------------------------------------------------------------------------
-- inventory_transactions
--
-- Append-only ledger of every stock change. Order-driven decrements are
-- written by the create_order() function; admin adjustments/restocks are
-- written by the adjust_stock() function. products.stock is always the
-- current, authoritative quantity; this table is the history behind it.
-- ----------------------------------------------------------------------------

create table inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  change_quantity integer not null check (change_quantity <> 0),
  reason inventory_reason not null,
  reference_order_id uuid references orders (id) on delete set null,
  note text,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index inventory_transactions_product_id_idx on inventory_transactions (product_id);
create index inventory_transactions_created_at_idx on inventory_transactions (created_at desc);

-- ----------------------------------------------------------------------------
-- updated_at maintenance
-- ----------------------------------------------------------------------------

create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

create trigger set_categories_updated_at before update on categories
  for each row execute function set_updated_at();

create trigger set_products_updated_at before update on products
  for each row execute function set_updated_at();

create trigger set_carts_updated_at before update on carts
  for each row execute function set_updated_at();

create trigger set_cart_items_updated_at before update on cart_items
  for each row execute function set_updated_at();

create trigger set_orders_updated_at before update on orders
  for each row execute function set_updated_at();
