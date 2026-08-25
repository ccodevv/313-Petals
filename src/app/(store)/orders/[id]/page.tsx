import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/order-status-badge";
import { OrderStatusTimeline } from "@/components/shared/order-status-timeline";
import { formatCurrency, formatDate, formatDateOnly } from "@/lib/utils/format";
import { getOrderById } from "@/features/orders/queries";

export const metadata: Metadata = { title: "Order Details" };

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Order {order.order_number}</h1>
          <p className="text-sm text-stone-500">Placed {formatDate(order.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.payment_status} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 p-5">
        <OrderStatusTimeline status={order.status} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 p-5">
          <h2 className="text-sm font-semibold text-stone-900">Contact</h2>
          <dl className="mt-3 space-y-1 text-sm text-stone-600">
            <div className="flex justify-between">
              <dt>Name</dt>
              <dd>{order.contact_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Phone</dt>
              <dd>{order.contact_phone}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Email</dt>
              <dd>{order.contact_email}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-stone-200 p-5">
          <h2 className="text-sm font-semibold text-stone-900">Fulfillment</h2>
          <dl className="mt-3 space-y-1 text-sm text-stone-600">
            <div className="flex justify-between">
              <dt>Method</dt>
              <dd className="capitalize">{order.fulfillment_type}</dd>
            </div>
            {order.fulfillment_type === "delivery" && (
              <div className="flex justify-between gap-4">
                <dt>Address</dt>
                <dd className="text-right">{order.delivery_address}</dd>
              </div>
            )}
            {order.preferred_datetime && (
              <div className="flex justify-between">
                <dt>Preferred</dt>
                <dd>{formatDateOnly(order.preferred_datetime)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Payment method</dt>
              <dd className="capitalize">{order.payment_method.replace("_", " ")}</dd>
            </div>
          </dl>
        </div>
      </div>

      {order.notes && (
        <div className="mt-6 rounded-2xl border border-stone-200 p-5">
          <h2 className="text-sm font-semibold text-stone-900">Notes</h2>
          <p className="mt-2 text-sm text-stone-600">{order.notes}</p>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-stone-200 p-5">
        <h2 className="text-sm font-semibold text-stone-900">Items</h2>
        <ul className="mt-3 divide-y divide-stone-200">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex justify-between py-2 text-sm">
              <span className="text-stone-700">
                {item.product_name} × {item.quantity}
              </span>
              <span className="font-medium text-stone-900">{formatCurrency(item.line_total)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-stone-200 pt-3">
          <span className="text-sm text-stone-500">Subtotal</span>
          <span className="text-sm text-stone-700">{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="mt-1 flex justify-between text-base font-semibold text-stone-900">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
