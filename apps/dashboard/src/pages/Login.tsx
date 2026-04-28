import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useToast } from "../components/Toast";
import { DOCS_URL, WEBSITE_URL } from "../lib/project";

export function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@shopora.dev");
  const [password, setPassword] = useState("admin123");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.show("Welcome back, admin", "success");
      nav("/");
    } catch (err) {
      toast.show(err instanceof Error ? err.message : "Sign-in failed", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-lg border border-[var(--color-border)] bg-white shadow-[0_42px_140px_-86px_rgba(27,39,34,0.54)] backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative min-h-[560px] overflow-hidden p-8 md:p-10">
          <img
            src="/images/editorial/login-workstation.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/96 via-black/58 to-transparent" />
          <div className="relative flex h-full flex-col justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="brand-mark grid h-10 w-10 place-items-center rounded-md">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M5 7.5h14l-1.4 9.5a2 2 0 01-2 1.7H8.4a2 2 0 01-2-1.7L5 7.5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <div className="text-lg font-bold leading-none">Shopora Admin</div>
                <div className="mono-label mt-1 text-slate-400">Commerce operations</div>
              </div>
            </div>

            <div>
              <p className="mono-label text-[var(--color-primary)]">Portfolio demo console</p>
              <h1 className="mt-4 max-w-[16ch] text-5xl font-bold tracking-tight md:text-6xl">
                Operate the store.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400">
                Manage premium catalog data, orders, users, discounts, and revenue analytics from
                the same API that powers the public storefront.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href={WEBSITE_URL} className="btn-secondary">
                  Storefront
                </a>
                <a href={DOCS_URL} target="_blank" rel="noreferrer" className="btn-secondary">
                  API docs
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center p-8 md:p-10">
          <div className="w-full">
            <p className="mono-label text-[var(--color-primary)]">Admin access</p>
            <h2 className="mt-3 text-4xl font-bold leading-tight">Sign in</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Seeded credentials are loaded from the local Mongo database. Admin role is required
              for this console.
            </p>
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <Field label="Email" type="email" value={email} onChange={setEmail} />
              <Field label="Password" type="password" value={password} onChange={setPassword} />
              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <div className="mt-5 rounded-md border border-[rgba(11,107,86,0.24)] bg-[rgba(11,107,86,0.06)] p-3 text-xs text-[var(--color-primary)]">
              Demo: <code>admin@shopora.dev</code> / <code>admin123</code>
            </div>
          </div>
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
      <span className="mono-label mb-1.5 block text-slate-400">{label}</span>
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
