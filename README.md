# Petals & Stems — Flower Shop E-Commerce

A small-business flower shop storefront and admin system built with
Next.js (App Router), TypeScript, Tailwind CSS, and Supabase (Postgres,
Auth, Storage, RLS).

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase project URL/anon key
npm run dev
```

Set up the database by running the SQL files in `supabase/migrations/` in
order against your Supabase project (via the SQL editor, or `supabase db
push` if you use the Supabase CLI), then optionally run `supabase/seed.sql`
for sample categories/products. To try the admin dashboard, register a
normal account through the app, then promote it in the SQL editor:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

## Architecture

```
src/
├── app/
│   ├── (store)/        customer storefront: home, products, cart, checkout, orders, profile
│   ├── (auth)/          login, register, forgot/update password
│   ├── auth/confirm/    Supabase email-link handler (route handler)
│   └── admin/           admin dashboard: products, categories, orders, customers, inventory, reports
├── components/
│   ├── ui/              generic building blocks (Button, Input, Card, Badge, ...)
│   ├── store/           storefront-specific UI
│   ├── admin/           admin-specific UI
│   └── shared/          shared across both (status badges, ...)
├── features/            business logic per domain: queries + server actions
├── lib/
│   ├── supabase/        browser/server/proxy Supabase clients
│   ├── validations/     zod schemas
│   └── utils/           formatting helpers, cn()
├── types/                Database types + derived app types
└── config/               site metadata, nav links, shared constants
```

Route groups `(store)` and `(auth)` give the storefront and auth pages their
own layouts without affecting the URL; `admin/` is a real path segment so it
can be matched and protected by `src/proxy.ts` (Next.js 16's replacement for
`middleware.ts`).

## Database schema

Nine tables, defined in `supabase/migrations/0001_init.sql`:

- **profiles** — one row per authenticated user (created automatically by a
  trigger on `auth.users`). Doubles as the "customer" record: a customer is
  just a user whose `role` is `customer`. A separate `customers` table was
  deliberately skipped to avoid duplicating identity data and having two
  sources of truth for the same person.
- **categories** — flower categories (Bouquets, Roses, ...).
- **products** — belongs to a category; tracks price, stock,
  `low_stock_threshold`, and `is_available`.
- **carts** / **cart_items** — one cart per profile; a cart item references a
  product and a quantity.
- **orders** / **order_items** — an order belongs to a profile and captures
  contact info, fulfillment (pickup/delivery), payment method/status, and
  totals. `order_items` snapshots the product's name and price at purchase
  time so historical orders stay accurate if a product is later renamed,
  repriced, or deleted.
- **inventory_transactions** — an append-only ledger of every stock change
  (order, restock, adjustment, return). `products.stock` is always the
  current quantity; this table is the audit trail behind it.

```
auth.users ──1:1── profiles ──1:N── orders ──1:N── order_items ──N:1── products ──N:1── categories
                       │                                                    │
                       └──1:1── carts ──1:N── cart_items ──N:1──────────────┘
                       └──1:N── inventory_transactions (as created_by) ──N:1── products
```

### Keeping inventory correct under concurrent checkouts

Orders are never created with a plain `insert` from the client. Both the
`orders`/`order_items` RLS policies and the app only allow order creation
through `create_order(...)`, a `SECURITY DEFINER` Postgres function
(`supabase/migrations/0002_functions.sql`) that, in one transaction:

1. Locks each ordered product's row (`SELECT ... FOR UPDATE`).
2. Confirms it's still available and has enough stock.
3. Snapshots name/price into `order_items`.
4. Decrements `products.stock` and appends an `inventory_transactions` row.
5. Clears the user's cart.

The row lock means two customers checking out the same low-stock product at
the same time can't both succeed — the second transaction blocks until the
first commits, then sees the updated stock and fails cleanly if there isn't
enough left. Admin stock adjustments go through the equivalent
`adjust_stock(...)` function.

### Authorization

Every table has Row Level Security enabled (`0003_rls.sql`):

- Customers can only read/write their own `profiles`, `carts`, `cart_items`,
  and can only *read* their own `orders`/`order_items`.
- `categories`/`products` are publicly readable when active/available;
  writes are admin-only.
- `orders`/`inventory_transactions` writes happen only through the
  `SECURITY DEFINER` functions above, or (for order status/payment updates)
  by an admin.
- A `guard_profile_role_change` trigger blocks anyone but an existing admin
  from changing a profile's `role`, so a customer can never self-promote.

`src/proxy.ts` mirrors this at the app layer: it refreshes the auth session
on every request and redirects unauthenticated users away from account
pages, and non-admins away from `/admin/**`, before a page even renders.
This is defense-in-depth on top of RLS, not a replacement for it — every
Supabase query still runs under the signed-in user's own JWT.

The Supabase **service-role key** is never used by this app; it should
never be added to client code or committed.

## Order statuses

`pending → confirmed → preparing → ready → out_for_delivery → completed`,
with `cancelled` reachable from the earlier states. Payment status is
tracked separately as `unpaid → paid → refunded`.

## Development phases

This project was built incrementally: project setup → database schema/RLS →
auth → storefront browsing → cart/checkout → order tracking → admin
dashboard → admin product/category/order/inventory management → reports →
polish. See commit history for the phase-by-phase progression.
