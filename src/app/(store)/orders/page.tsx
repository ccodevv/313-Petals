import Link from "next/link";
import type { Metadata } from "next";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/order-status-badge";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { getOrdersForCurrentUser } from "@/features/orders/queries";

export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const orders = await getOrdersForCurrentUser();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-stone-900">My Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No orders yet"
            description="Once you place an order, it will show up here."
            action={
              <Link href="/products" className={buttonVariants()}>
                Start shopping
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium text-stone-900">{order.order_number}</td>
                  <td className="px-4 py-3 text-stone-600">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 text-stone-600">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge status={order.payment_status} />
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/orders/${order.id}`}
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
    </div>
  );
}
