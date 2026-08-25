"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryFormState } from "@/features/categories/actions";
import type { Category } from "@/types";

const initialState: CategoryFormState = { error: null };

export function CategoryForm({
  action,
  category,
}: {
  action: (state: CategoryFormState, formData: FormData) => Promise<CategoryFormState>;
  category?: Category;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={category?.name} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={category?.description ?? ""} />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={category?.is_active ?? true}
          className="h-4 w-4 rounded border-stone-300 text-rose-600 focus:ring-rose-500"
        />
        Active (visible to customers)
      </label>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" isLoading={isPending}>
        {category ? "Save changes" : "Create category"}
      </Button>
    </form>
  );
}
