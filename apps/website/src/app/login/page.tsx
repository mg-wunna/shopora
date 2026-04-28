"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, useToast } from "../../components/Providers";

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("demo@shopora.dev");
  const [password, setPassword] = useState("password");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/products");
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Sign-in failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="shell py-10 lg:py-14">
      <div className="commerce-panel grid overflow-hidden lg:grid-cols-[1fr_430px]">
        <section className="relative hidden min-h-[540px] overflow-hidden lg:block">
          <img
            src="/images/editorial/login-workstation.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/42 to-transparent" />
          <div className="image-overlay-copy relative flex h-full flex-col justify-between p-8">
            <div>
              <div className="mono-label text-[var(--color-primary)]">Shopora account</div>
              <h1 className="font-display mt-3 max-w-lg text-5xl font-bold leading-tight">
                Return to your cart, orders, and Stripe test checkout.
              </h1>
            </div>
            <div className="grid max-w-lg grid-cols-3 gap-3 text-sm">
              <Proof label="Cart" value="Saved" />
              <Proof label="Payment" value="Stripe" />
              <Proof label="Orders" value="Tracked" />
            </div>
          </div>
        </section>

        <section className="p-6 md:p-8">
          <div className="mono-label text-[var(--color-primary)]">Customer access</div>
          <h2 className="font-display mt-3 text-5xl font-bold leading-tight">Welcome back</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Demo credentials are prefilled so you can move straight into checkout.
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} />
            <Field label="Password" type="password" value={password} onChange={setPassword} />
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Signing in..." : "Sign in"}
            </button>
            <p className="text-center text-sm text-slate-400">
              New here?{" "}
              <Link href="/register" className="text-indigo-300 hover:text-[var(--color-primary)]">
                Create an account
              </Link>
            </p>
          </form>
          <DemoHint />
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
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
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
    </label>
  );
}

function Proof({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/20 bg-white/12 p-3 backdrop-blur-sm">
      <div className="mono-label image-overlay-muted">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}

function DemoHint() {
  return (
    <div className="mt-6 rounded-lg border border-[rgba(11,107,86,0.24)] bg-[rgba(11,107,86,0.06)] p-3 text-xs text-[var(--color-primary)]">
      <div className="font-semibold">Demo accounts</div>
      <div className="mt-1 grid gap-0.5 font-mono">
        <span>admin@shopora.dev / admin123</span>
        <span>demo@shopora.dev / password</span>
      </div>
    </div>
  );
}
