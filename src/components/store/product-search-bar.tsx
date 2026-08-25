import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
];

export function ProductSearchBar({
  search,
  sort,
  category,
}: {
  search?: string;
  sort?: string;
  category?: string;
}) {
  return (
    <form method="get" className="flex flex-col gap-3 sm:flex-row">
      {category && <input type="hidden" name="category" value={category} />}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <Input
          type="search"
          name="search"
          placeholder="Search flowers..."
          defaultValue={search}
          className="pl-9"
        />
      </div>
      <Select name="sort" defaultValue={sort ?? "newest"} className="sm:w-56">
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="outline">
        Apply
      </Button>
    </form>
  );
}
