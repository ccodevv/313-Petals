import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <div>
      <h1 className="text-lg font-semibold text-stone-900">Welcome back</h1>
      <p className="mt-1 text-sm text-stone-500">Sign in to continue shopping.</p>
      <div className="mt-6">
        <LoginForm redirectTo={redirectTo ?? "/"} />
      </div>
    </div>
  );
}
