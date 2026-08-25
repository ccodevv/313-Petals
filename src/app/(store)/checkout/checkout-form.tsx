"use client";

import { useActionState, useState } from "react";
import { placeOrder, type CheckoutActionState } from "@/features/checkout/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  FULFILLMENT_TYPES,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
} from "@/config/constants";
import type { Profile } from "@/types";

const initialState: CheckoutActionState = { error: null };

export function CheckoutForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(placeOrder, initialState);
  const [fulfillmentType, setFulfillmentType] = useState<(typeof FULFILLMENT_TYPES)[number]>(
    "pickup",
  );

  return (
    <form action={formAction} className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-stone-900">Your Information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contactName">Full name</Label>
            <Input
              id="contactName"
              name="contactName"
              defaultValue={profile.full_name}
              required
            />
          </div>
          <div>
            <Label htmlFor="contactPhone">Contact number</Label>
            <Input
              id="contactPhone"
              name="contactPhone"
              defaultValue={profile.phone ?? ""}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={profile.email}
              required
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-stone-900">Fulfillment</h2>
        <div className="flex gap-3">
          {FULFILLMENT_TYPES.map((type) => (
            <label
              key={type}
              className={`flex-1 cursor-pointer rounded-lg border px-4 py-2 text-center text-sm font-medium capitalize ${
                fulfillmentType === type
                  ? "border-rose-600 bg-rose-50 text-rose-700"
                  : "border-stone-300 text-stone-600"
              }`}
            >
              <input
                type="radio"
                name="fulfillmentType"
                value={type}
                checked={fulfillmentType === type}
                onChange={() => setFulfillmentType(type)}
                className="sr-only"
              />
              {type}
            </label>
          ))}
        </div>

        {fulfillmentType === "delivery" && (
          <div>
            <Label htmlFor="deliveryAddress">Delivery address</Label>
            <Textarea
              id="deliveryAddress"
              name="deliveryAddress"
              defaultValue={profile.delivery_address ?? ""}
              rows={2}
              required
            />
          </div>
        )}

        <div>
          <Label htmlFor="preferredDatetime">Preferred date/time</Label>
          <Input id="preferredDatetime" name="preferredDatetime" type="datetime-local" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-stone-900">Payment</h2>
        <div>
          <Label htmlFor="paymentMethod">Payment method</Label>
          <Select id="paymentMethod" name="paymentMethod" defaultValue={PAYMENT_METHODS[0]}>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {PAYMENT_METHOD_LABELS[method]}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-stone-500">
            Payment is settled at pickup/delivery for now - online payment can be added later.
          </p>
        </div>
        <div>
          <Label htmlFor="notes">Order notes (optional)</Label>
          <Textarea id="notes" name="notes" rows={2} placeholder="Card message, special requests..." />
        </div>
      </section>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" size="lg" className="w-full" isLoading={isPending}>
        Place Order
      </Button>
    </form>
  );
}
