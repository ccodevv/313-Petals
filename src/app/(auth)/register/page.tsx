import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-stone-900">Create your account</h1>
      <p className="mt-1 text-sm text-stone-500">
        Join to track orders and check out faster.
      </p>
      <div className="mt-6">
        <RegisterForm />
      </div>
    </div>
  );
}
