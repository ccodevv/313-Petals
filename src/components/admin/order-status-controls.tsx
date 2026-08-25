"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { updateOrderPaymentStatus, updateOrderStatus } from "@/features/orders/actions";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type PaymentStatus,
} from "@/config/constants";

export function OrderStatusControls({
  orderId,
  status,
  paymentStatus,
}: {
  orderId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(next: OrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      if (result?.error) toast.error(result.error);
      else toast.success("Order status updated");
    });
  }

  function handlePaymentChange(next: PaymentStatus) {
    startTransition(async () => {
      const result = await updateOrderPaymentStatus(orderId, next);
      if (result?.error) toast.error(result.error);
      else toast.success("Payment status updated");
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="status">Order status</Label>
        <Select
          id="status"
          defaultValue={status}
          disabled={isPending}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="paymentStatus">Payment status</Label>
        <Select
          id="paymentStatus"
          defaultValue={paymentStatus}
          disabled={isPending}
          onChange={(e) => handlePaymentChange(e.target.value as PaymentStatus)}
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PAYMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
