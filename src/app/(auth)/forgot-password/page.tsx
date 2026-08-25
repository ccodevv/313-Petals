import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-stone-900">Reset your password</h1>
      <p className="mt-1 text-sm text-stone-500">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
