"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, useToast } from "../../components/Providers";

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.show("Password must be at least 6 characters", "error");
      return;
    }
    setSubmitting(true);
    try {
      await register(name, email, password);
      router.push("/products");
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Sign-up failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="shell py-10 lg:py-14">
      <div className="commerce-panel grid overflow-hidden lg:grid-cols-[1fr_430px]">
        <section className="relative hidden min-h-[560px] overflow-hidden lg:block">
          <img
            src="/images/editorial/register-product.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/48 to-transparent" />
          <div className="image-overlay-copy relative flex h-full flex-col justify-between p-8">
            <div>
              <div className="mono-label text-[var(--color-primary)]">New customer</div>
              <h1 className="font-display mt-3 max-w-lg text-5xl font-bold leading-tight">
                Create an account and test the full commerce loop.
              </h1>
            </div>
            <div className="max-w-md rounded-lg border border-white/20 bg-white/12 p-4 text-sm leading-6 text-white backdrop-blur-sm">
              Add products, apply discounts, complete Stripe test checkout, and inspect the receipt.
            </div>
          </div>
        </section>

        <section className="p-6 md:p-8">
          <div className="mono-label text-[var(--color-primary)]">Create account</div>
          <h2 className="font-display mt-3 text-5xl font-bold leading-tight">Start shopping</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            A local demo account is enough to use cart, orders, and checkout.
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Field label="Name" type="text" value={name} onChange={setName} />
            <Field label="Email" type="email" value={email} onChange={setEmail} />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              hint="At least 6 characters"
            />
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Creating account..." : "Create account"}
            </button>
            <p className="text-center text-sm text-slate-400">
              Already have one?{" "}
              <Link href="/login" className="text-indigo-300 hover:text-[var(--color-primary)]">
                Sign in
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  hint,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="input"
      />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
