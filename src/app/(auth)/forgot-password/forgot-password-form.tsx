"use client";

import { useActionState } from "react";
import {
  requestPasswordReset,
  type AuthActionState,
} from "@/features/authentication/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = { error: null };

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    initialState,
  );

  if (state.message) {
    return <p className="text-sm text-emerald-700">{state.message}</p>;
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" className="w-full" isLoading={isPending}>
        Send reset link
      </Button>
    </form>
  );
}
