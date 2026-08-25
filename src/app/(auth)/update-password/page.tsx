import type { Metadata } from "next";
import { UpdatePasswordForm } from "./update-password-form";

export const metadata: Metadata = { title: "Update password" };

export default function UpdatePasswordPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-stone-900">Choose a new password</h1>
      <div className="mt-6">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
