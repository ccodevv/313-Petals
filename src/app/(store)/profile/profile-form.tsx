"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { updateOwnProfile, type ProfileActionState } from "@/features/customers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/types";

const initialState: ProfileActionState = { error: null };

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(updateOwnProfile, initialState);
  const lastHandled = useRef(initialState);

  useEffect(() => {
    if (state === lastHandled.current) return;
    lastHandled.current = state;

    if (state.error) toast.error(state.error);
    else if (state.success) toast.success("Profile updated");
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={profile.email} disabled />
      </div>
      <div>
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" defaultValue={profile.full_name} required />
      </div>
      <div>
        <Label htmlFor="phone">Contact number</Label>
        <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
      </div>
      <div>
        <Label htmlFor="deliveryAddress">Delivery address</Label>
        <Textarea
          id="deliveryAddress"
          name="deliveryAddress"
          rows={2}
          defaultValue={profile.delivery_address ?? ""}
        />
      </div>
      <Button type="submit" isLoading={isPending}>
        Save changes
      </Button>
    </form>
  );
}
