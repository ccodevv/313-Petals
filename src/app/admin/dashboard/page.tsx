import Link from "next/link";
import type { Metadata } from "next";
import { DollarSign, ShoppingCart, Clock, CheckCircle2, PackageX } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/shared/order-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { getDashboardStats } from "@/features/reports/queries";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Total Sales" value={formatCurrency(stats.totalSales)} icon={DollarSign} />
        <StatCard label="Today's Sales" value={formatCurrency(stats.todaySales)} icon={DollarSign} />
        <StatCard label="Total Orders" value={String(stats.totalOrders)} icon={ShoppingCart} />
        <StatCard label="Pending Orders" value={String(stats.pendingOrders)} icon={Clock} />
        <StatCard label="Completed Orders" value={String(stats.completedOrders)} icon={CheckCircle2} />
        <StatCard
          label="Low Stock Products"
          value={String(stats.lowStockCount)}
          icon={PackageX}
          tone={stats.lowStockCount > 0 ? "warning" : "default"}
        />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white">
        <div className="flex items-center justify-between border-b border-stone-200 p-5">
          <h2 className="text-base font-semibold text-stone-900">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-rose-700 hover:underline">
            View all
          </Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No orders yet" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-stone-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Order #</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-rose-700 hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-stone-600">
                      {order.profile?.full_name || order.profile?.email || "—"}
                    </td>
                    <td className="px-5 py-3 text-stone-600">{formatDate(order.created_at)}</td>
                    <td className="px-5 py-3 text-stone-600">{formatCurrency(order.total)}</td>
                    <td className="px-5 py-3">
                      <PaymentStatusBadge status={order.payment_status} />
                    </td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
