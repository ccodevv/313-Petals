import { Badge } from "@/components/ui/badge";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type PaymentStatus,
} from "@/config/constants";

const ORDER_STATUS_TONES: Record<
  OrderStatus,
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  pending: "warning",
  confirmed: "info",
  preparing: "info",
  ready: "info",
  out_for_delivery: "info",
  completed: "success",
  cancelled: "danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={ORDER_STATUS_TONES[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}

const PAYMENT_STATUS_TONES: Record<
  PaymentStatus,
  "neutral" | "success" | "warning" | "danger" | "info"
> = {
  unpaid: "warning",
  paid: "success",
  refunded: "neutral",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={PAYMENT_STATUS_TONES[status]}>{PAYMENT_STATUS_LABELS[status]}</Badge>;
}
