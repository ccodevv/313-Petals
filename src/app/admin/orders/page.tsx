import Link from "next/link";
import type { Metadata } from "next";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/order-status-badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { getAllOrdersAdmin } from "@/features/orders/queries";
import {
  ADMIN_TABLE_PAGE_SIZE,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type PaymentStatus,
} from "@/config/constants";

export const metadata: Metadata = { title: "Orders" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; payment?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const status = ORDER_STATUSES.includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : undefined;
  const paymentStatus = PAYMENT_STATUSES.includes(params.payment as PaymentStatus)
    ? (params.payment as PaymentStatus)
    : undefined;

  const { orders, totalCount } = await getAllOrdersAdmin({
    search: params.search,
    status,
    paymentStatus,
    page,
  });
  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_TABLE_PAGE_SIZE));

  function buildHref(targetPage: number) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (status) query.set("status", status);
    if (paymentStatus) query.set("payment", paymentStatus);
    if (targetPage > 1) query.set("page", String(targetPage));
    const qs = query.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-stone-900">Orders</h1>

      <form method="get" className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="search"
          name="search"
          placeholder="Search order #, name, email..."
          defaultValue={params.search}
          className="sm:max-w-xs"
        />
        <Select name="status" defaultValue={status ?? ""} className="sm:w-48">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select name="payment" defaultValue={paymentStatus ?? ""} className="sm:w-48">
          <option value="">All payment statuses</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PAYMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      {orders.length === 0 ? (
        <EmptyState title="No orders found" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Order #</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3 font-medium text-stone-900">{order.order_number}</td>
                  <td className="px-5 py-3 text-stone-600">
                    {order.profile?.full_name || order.contact_name}
                  </td>
                  <td className="px-5 py-3 text-stone-600">{formatDate(order.created_at)}</td>
                  <td className="px-5 py-3 text-stone-600">{formatCurrency(order.total)}</td>
                  <td className="px-5 py-3">
                    <PaymentStatusBadge status={order.payment_status} />
                  </td>
                  <td className="px-5 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-rose-700 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
