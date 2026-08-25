import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/order-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate, formatDateOnly } from "@/lib/utils/format";
import { getCustomerById, getOrdersForCustomer } from "@/features/customers/queries";

export const metadata: Metadata = { title: "Customer Details" };

export default async function AdminCustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) notFound();

  const orders = await getOrdersForCustomer(id);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">{customer.full_name || customer.email}</h1>
        <p className="text-sm text-stone-500">Customer since {formatDateOnly(customer.created_at)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-stone-400">Email</p>
          <p className="mt-1 text-sm font-medium text-stone-900">{customer.email}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-stone-400">Phone</p>
          <p className="mt-1 text-sm font-medium text-stone-900">{customer.phone || "—"}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-stone-400">Orders</p>
          <p className="mt-1 text-sm font-medium text-stone-900">{customer.order_count}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-stone-400">Total spent</p>
          <p className="mt-1 text-sm font-medium text-stone-900">
            {formatCurrency(customer.total_spent)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white">
        <h2 className="border-b border-stone-200 p-5 text-base font-semibold text-stone-900">
          Order History
        </h2>
        {orders.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No orders yet" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Order #</th>
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
        )}
      </div>
    </div>
  );
}
