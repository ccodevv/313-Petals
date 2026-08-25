import Link from "next/link";
import type { Metadata } from "next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrency, formatDateOnly } from "@/lib/utils/format";
import { getCustomersAdmin } from "@/features/customers/queries";
import { ADMIN_TABLE_PAGE_SIZE } from "@/config/constants";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { customers, totalCount } = await getCustomersAdmin({ search: params.search, page });
  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_TABLE_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-stone-900">Customers</h1>

      <form method="get" className="flex max-w-sm gap-3">
        <Input type="search" name="search" placeholder="Search by name or email..." defaultValue={params.search} />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {customers.length === 0 ? (
        <EmptyState title="No customers found" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="text-stone-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 font-medium">Total spent</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3 font-medium text-stone-900">
                    {customer.full_name || "—"}
                  </td>
                  <td className="px-5 py-3 text-stone-600">{customer.email}</td>
                  <td className="px-5 py-3 text-stone-600">{customer.phone || "—"}</td>
                  <td className="px-5 py-3 text-stone-600">{formatDateOnly(customer.created_at)}</td>
                  <td className="px-5 py-3 text-stone-600">{customer.order_count}</td>
                  <td className="px-5 py-3 text-stone-600">{formatCurrency(customer.total_spent)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/customers/${customer.id}`}
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

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        buildHref={(p) => {
          const query = new URLSearchParams();
          if (params.search) query.set("search", params.search);
          if (p > 1) query.set("page", String(p));
          const qs = query.toString();
          return qs ? `/admin/customers?${qs}` : "/admin/customers";
        }}
      />
    </div>
  );
}
