-- ============================================================================
-- 0005_customer_summary_view.sql
-- Read-only view for the admin customer list: order count and total spend
-- per customer, without an N+1 query per row. This is a view over
-- existing data, not a new table - there's still one source of truth for
-- orders.
--
-- security_invoker means the view runs with the querying role's own
-- permissions, so the RLS policies on profiles/orders still apply: an
-- admin sees every customer's stats, while a customer querying it (not
-- that the app does) would only ever see their own row, the same data
-- they can already see on "My Orders".
-- ============================================================================

create view customer_summary
  with (security_invoker = true)
  as
  select
    p.id,
    p.full_name,
    p.email,
    p.phone,
    p.created_at,
    count(o.id) as order_count,
    coalesce(sum(o.total) filter (where o.payment_status = 'paid'), 0) as total_spent
  from profiles p
  left join orders o on o.profile_id = p.id
  where p.role = 'customer'
  group by p.id;
