import type { Metadata } from "next";
import { ProfileForm } from "./profile-form";
import { requireProfile } from "@/features/authentication/queries";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const profile = await requireProfile("/profile");

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-stone-900">My Profile</h1>
      <p className="mt-1 text-sm text-stone-500">
        Keep your contact details up to date for smoother checkouts.
      </p>
      <div className="mt-8">
        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}
