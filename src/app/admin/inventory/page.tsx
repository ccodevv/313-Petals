import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { StockAdjustmentForm } from "@/components/admin/stock-adjustment-form";
import { formatDate } from "@/lib/utils/format";
import {
  getAllProductsForInventory,
  getLowStockProducts,
  getRecentInventoryTransactions,
} from "@/features/inventory/queries";

export const metadata: Metadata = { title: "Inventory" };

export default async function AdminInventoryPage() {
  const [lowStockProducts, products, transactions] = await Promise.all([
    getLowStockProducts(),
    getAllProductsForInventory(),
    getRecentInventoryTransactions(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-stone-900">Inventory</h1>

      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-base font-semibold text-stone-900">Adjust Stock</h2>
        <p className="mt-1 text-sm text-stone-500">
          Use a positive amount for restocks/returns, negative for shrinkage or corrections.
        </p>
        <div className="mt-4">
          <StockAdjustmentForm products={products} />
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white">
        <h2 className="border-b border-stone-200 p-5 text-base font-semibold text-stone-900">
          Low Stock Products
        </h2>
        {lowStockProducts.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Nothing is low on stock" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Threshold</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {lowStockProducts.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3 font-medium text-stone-900">{product.name}</td>
                  <td className="px-5 py-3 text-stone-600">
                    {product.stock}
                    {product.stock === 0 && (
                      <Badge tone="danger" className="ml-2">
                        Out of stock
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-stone-600">{product.low_stock_threshold}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="font-medium text-rose-700 hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white">
        <h2 className="border-b border-stone-200 p-5 text-base font-semibold text-stone-900">
          Recent Stock History
        </h2>
        {transactions.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No stock movements yet" />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Change</th>
                <th className="px-5 py-3 font-medium">Reason</th>
                <th className="px-5 py-3 font-medium">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-5 py-3 text-stone-600">{formatDate(tx.created_at)}</td>
                  <td className="px-5 py-3 text-stone-900">{tx.product?.name ?? "—"}</td>
                  <td
                    className={`px-5 py-3 font-medium ${
                      tx.change_quantity > 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {tx.change_quantity > 0 ? `+${tx.change_quantity}` : tx.change_quantity}
                  </td>
                  <td className="px-5 py-3 capitalize text-stone-600">{tx.reason}</td>
                  <td className="px-5 py-3 text-stone-500">{tx.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
