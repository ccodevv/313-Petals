import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/admin/stat-card";
import { SalesBarChart } from "@/components/admin/sales-bar-chart";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils/format";
import { getSalesReport } from "@/features/reports/queries";
import { ShoppingCart, CheckCircle2, XCircle, PackageX } from "lucide-react";

export const metadata: Metadata = { title: "Reports" };

export default async function AdminReportsPage() {
  const report = await getSalesReport();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-stone-900">Reports</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Orders" value={String(report.totalOrders)} icon={ShoppingCart} />
        <StatCard label="Completed Orders" value={String(report.completedOrders)} icon={CheckCircle2} />
        <StatCard label="Cancelled Orders" value={String(report.cancelledOrders)} icon={XCircle} />
        <StatCard
          label="Low Stock Products"
          value={String(report.lowStockCount)}
          icon={PackageX}
          tone={report.lowStockCount > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales (14 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesBarChart buckets={report.dailySales} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Weekly Sales (8 weeks)</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesBarChart buckets={report.weeklySales} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesBarChart buckets={report.monthlySales} />
          </CardContent>
        </Card>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white">
        <h2 className="border-b border-stone-200 p-5 text-base font-semibold text-stone-900">
          Best-Selling Products
        </h2>
        {report.bestSellers.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No sales data yet" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Units Sold</th>
                <th className="px-5 py-3 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {report.bestSellers.map((item) => (
                <tr key={item.productName}>
                  <td className="px-5 py-3 font-medium text-stone-900">{item.productName}</td>
                  <td className="px-5 py-3 text-stone-600">{item.quantitySold}</td>
                  <td className="px-5 py-3 text-stone-600">{formatCurrency(item.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {report.lowStockCount > 0 && (
        <p className="text-sm text-stone-500">
          <Link href="/admin/inventory" className="font-medium text-rose-700 hover:underline">
            View low-stock products in Inventory →
          </Link>
        </p>
      )}
    </div>
  );
}
