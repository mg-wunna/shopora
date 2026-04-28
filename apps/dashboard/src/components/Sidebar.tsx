import { NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { DOCS_URL, REPO_URL, WEBSITE_URL } from "../lib/project";

const NAV = [
  { to: "/", label: "Overview", icon: GridIcon },
  { to: "/products", label: "Products", icon: BoxIcon },
  { to: "/orders", label: "Orders", icon: ReceiptIcon },
  { to: "/users", label: "Users", icon: UsersIcon },
  { to: "/discounts", label: "Discounts", icon: TagIcon },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <>
      <aside className="hidden h-screen w-72 flex-col border-r border-[var(--color-border)] bg-white/86 backdrop-blur-xl lg:flex">
        <div className="px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="brand-mark grid h-10 w-10 place-items-center rounded-md">
              <LogoIcon />
            </div>
            <div>
              <div className="text-lg font-bold leading-none">Shopora</div>
              <div className="mono-label mt-1 text-slate-500">Commerce Ops</div>
            </div>
          </div>
          <div className="mt-5 rounded-md border border-white/10 bg-white/72 p-3">
            <div className="mono-label text-[var(--color-primary)]">Live stack</div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Catalog, orders, users, discounts, analytics, and API docs backed by seeded Mongo
              data.
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-[rgba(11,107,86,0.1)] text-[var(--color-primary)]"
                    : "text-slate-400 hover:bg-[rgba(11,107,86,0.05)] hover:text-[var(--color-primary)]"
                }`
              }
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 pb-4">
          <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
            <a className="btn-secondary px-2 text-[10px]" href={WEBSITE_URL}>
              Store
            </a>
            <a
              className="btn-secondary px-2 text-[10px]"
              href={DOCS_URL}
              target="_blank"
              rel="noreferrer"
            >
              API
            </a>
            <a
              className="btn-secondary px-2 text-[10px]"
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
            >
              Repo
            </a>
          </div>
          {user && (
            <div className="mt-3 flex items-center gap-3 rounded-md border border-white/10 bg-white/72 p-2">
              <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{user.name}</div>
                <div className="truncate text-xs text-slate-500">{user.email}</div>
              </div>
            </div>
          )}
          <button type="button" onClick={logout} className="btn-secondary mt-2 w-full text-xs">
            Sign out
          </button>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-white/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="brand-mark grid h-8 w-8 place-items-center rounded-md">
              <LogoIcon />
            </div>
            <div>
              <div className="text-base font-bold leading-none">Shopora</div>
              <div className="mono-label mt-0.5 text-[9px] text-slate-500">Ops</div>
            </div>
          </div>
          <button type="button" onClick={logout} className="btn-secondary px-3 py-1.5 text-xs">
            Sign out
          </button>
        </div>
      </header>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 gap-1 rounded-lg border border-white/10 bg-white/90 p-1 backdrop-blur-xl lg:hidden">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `grid place-items-center rounded-md px-1 py-2 text-[10px] font-semibold transition ${
                isActive ? "bg-[rgba(11,107,86,0.1)] text-[var(--color-primary)]" : "text-slate-400"
              }`
            }
          >
            <item.icon />
            <span className="mt-1">{item.label.split(" ")[0]}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

function LogoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M5 7.5h14l-1.4 9.5a2 2 0 01-2 1.7H8.4a2 2 0 01-2-1.7L5 7.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9 7.5V6a3 3 0 116 0v1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M3 7l9-4 9 4M3 7v10l9 4 9-4V7M3 7l9 4M21 7l-9 4M12 11v10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ReceiptIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M5 3v18l3-2 3 2 3-2 3 2 3-2V3M9 8h6M9 12h6M9 16h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M16 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM21 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M20 12L12 20l-8-8V4h8l8 8zM7 7h.01"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
